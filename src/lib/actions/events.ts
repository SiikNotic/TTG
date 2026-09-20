"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { zonedTimeToUtcISOString, TIMEZONES } from "@/lib/timezone";
import { CATEGORIES, type EventCategory } from "@/lib/categories";
import { slugWithSuffix } from "@/lib/slug";
import type { EventRules } from "@/lib/event-rules";
import type { ActionState } from "@/lib/actions/action-state";
import type { Database } from "@/lib/supabase/database.types";

type EventStatus = Database["public"]["Enums"]["event_status"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value));
const TIMEZONE_VALUES = new Set(TIMEZONES.map((t) => t.value));
// Allowlist explícita, no "startsWith('image/')": eso también deja pasar
// image/svg+xml, y un SVG puede llevar <script> embebido (XSS almacenado
// si alguien abre la imagen directo). El bucket además tiene su propio
// allowed_mime_types como segunda barrera del lado de Storage.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

interface ParsedEventForm {
  title: string;
  description: string;
  category: EventCategory;
  startsAtIso: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  capacity: number;
  minAge: number | null;
  rules: EventRules;
}

function parseEventForm(formData: FormData): { data: ParsedEventForm } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const timezone = String(formData.get("timezone") ?? "America/Bogota");
  const venueName = String(formData.get("venueName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "");
  const ageOption = String(formData.get("ageOption") ?? "todas");
  const customAgeRaw = String(formData.get("customAge") ?? "");
  const customRulesRaw = String(formData.get("customRules") ?? "");

  if (!title) return { error: "Ingresa el nombre del evento." };
  if (title.length > 120) return { error: "El nombre es demasiado largo (máx. 120 caracteres)." };
  if (!CATEGORY_VALUES.has(category as EventCategory)) return { error: "Selecciona una categoría válida." };
  if (!date || !time) return { error: "Ingresa la fecha y hora del evento." };
  if (!TIMEZONE_VALUES.has(timezone)) return { error: "Selecciona una zona horaria válida." };
  if (!venueName) return { error: "Ingresa el nombre del lugar." };
  if (!city) return { error: "Ingresa la ciudad." };

  const capacity = Number(capacityRaw);
  if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 1_000_000) {
    return { error: "La capacidad debe ser un número entero mayor a 0." };
  }

  let minAge: number | null = null;
  if (ageOption === "18") minAge = 18;
  else if (ageOption === "21") minAge = 21;
  else if (ageOption === "custom") {
    const customAge = Number(customAgeRaw);
    if (!Number.isInteger(customAge) || customAge <= 0 || customAge > 100) {
      return { error: "Ingresa una edad mínima válida (1-100)." };
    }
    minAge = customAge;
  } else if (ageOption !== "todas") {
    return { error: "Selecciona una restricción de edad válida." };
  }

  let startsAtIso: string;
  try {
    startsAtIso = zonedTimeToUtcISOString(date, time, timezone);
  } catch {
    return { error: "Fecha u hora inválida." };
  }
  if (Number.isNaN(new Date(startsAtIso).getTime())) {
    return { error: "Fecha u hora inválida." };
  }

  const rules: EventRules = {
    idRequired: formData.get("rule_idRequired") === "on",
    invitationCode: formData.get("rule_invitationCode") === "on",
    studentsOnly: formData.get("rule_studentsOnly") === "on",
    membersOnly: formData.get("rule_membersOnly") === "on",
    promoCode: formData.get("rule_promoCode") === "on",
    custom: customRulesRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 15),
  };

  return {
    data: {
      title,
      description,
      category: category as EventCategory,
      startsAtIso,
      timezone,
      venueName,
      address,
      city,
      capacity,
      minAge,
      rules,
    },
  };
}

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "organizador" && profile.role !== "admin")) {
    return { error: "Tu cuenta no tiene permisos para crear eventos." };
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      organizer_id: user.id,
      slug: slugWithSuffix(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      starts_at: parsed.data.startsAtIso,
      timezone: parsed.data.timezone,
      venue_name: parsed.data.venueName,
      address: parsed.data.address,
      city: parsed.data.city,
      capacity: parsed.data.capacity,
      min_age: parsed.data.minAge,
      rules: parsed.data.rules as unknown as Database["public"]["Tables"]["events"]["Insert"]["rules"],
      status: "borrador",
    })
    .select("id")
    .single();

  if (error || !event) return { error: "No se pudo crear el evento." };

  revalidatePath("/organizador");
  redirect(`/organizador/eventos/${event.id}`);
}

export async function updateEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };

  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  // La cláusula .eq("id", ...) más la policy de UPDATE (organizer_id =
  // auth.uid() o admin) son las que realmente impiden editar el evento de
  // otro organizador: si la fila no es tuya, RLS la filtra y data llega
  // null, sin importar qué eventId se haya mandado en el formulario.
  const { data, error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      starts_at: parsed.data.startsAtIso,
      timezone: parsed.data.timezone,
      venue_name: parsed.data.venueName,
      address: parsed.data.address,
      city: parsed.data.city,
      capacity: parsed.data.capacity,
      min_age: parsed.data.minAge,
      rules: parsed.data.rules as unknown as Database["public"]["Tables"]["events"]["Insert"]["rules"],
    })
    .eq("id", eventId)
    .select("id")
    .maybeSingle();

  if (error) return { error: "No se pudo actualizar el evento." };
  if (!data) return { error: "No tienes permiso para editar este evento." };

  revalidatePath(`/organizador/eventos/${eventId}`);
  revalidatePath("/organizador");
  return { success: "Evento actualizado." };
}

async function setEventStatus(
  supabase: SupabaseServerClient,
  eventId: string,
  allowedFrom: EventStatus[],
  to: EventStatus
): Promise<ActionState> {
  const { data, error } = await supabase
    .from("events")
    .update({ status: to })
    .eq("id", eventId)
    .in("status", allowedFrom)
    .select("id")
    .maybeSingle();

  if (error) return { error: "No se pudo actualizar el estado del evento." };
  if (!data) {
    return {
      error: "No se pudo actualizar: verifica que el evento sea tuyo y esté en un estado válido para esta acción.",
    };
  }

  revalidatePath(`/organizador/eventos/${eventId}`);
  revalidatePath("/organizador");
  return { success: "Estado actualizado." };
}

export async function publishEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("ticket_types")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (!count || count < 1) {
    return { error: "Agrega al menos un tipo de entrada antes de publicar." };
  }

  return setEventStatus(supabase, eventId, ["borrador", "pausado"], "publicado");
}

export async function pauseEventSales(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };
  const supabase = await createClient();
  return setEventStatus(supabase, eventId, ["publicado"], "pausado");
}

export async function resumeEventSales(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };
  const supabase = await createClient();
  return setEventStatus(supabase, eventId, ["pausado"], "publicado");
}

export async function cancelEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };
  const supabase = await createClient();
  return setEventStatus(supabase, eventId, ["borrador", "publicado", "pausado"], "cancelado");
}

export async function deleteDraftEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("status", "borrador")
    .select("id")
    .maybeSingle();

  if (error) return { error: "No se pudo eliminar el borrador." };
  if (!data) return { error: "Solo puedes eliminar borradores propios." };

  revalidatePath("/organizador");
  redirect("/organizador");
}

export async function uploadEventCover(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  const file = formData.get("cover");

  if (!eventId) return { error: "Evento inválido." };
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { error: "El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)." };
  if (file.size > 4 * 1024 * 1024) return { error: "La imagen no puede superar 4 MB." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { data: event } = await supabase.from("events").select("id, organizer_id").eq("id", eventId).maybeSingle();
  if (!event || event.organizer_id !== user.id) return { error: "No tienes permiso sobre este evento." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  // La ruta empieza con el user id del organizador: la policy de Storage
  // exige que coincida con auth.uid(), así nadie puede escribir sobre la
  // portada de un evento ajeno.
  const path = `${user.id}/${eventId}/cover.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("event-covers")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: "No se pudo subir la imagen." };

  const { data: publicUrlData } = supabase.storage.from("event-covers").getPublicUrl(path);
  const coverUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("events")
    .update({ cover_image_url: coverUrl })
    .eq("id", eventId);
  if (dbError) return { error: "No se pudo guardar la imagen." };

  revalidatePath(`/organizador/eventos/${eventId}`);
  revalidatePath("/organizador");
  return { success: "Imagen actualizada." };
}
