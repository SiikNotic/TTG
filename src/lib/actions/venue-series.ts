"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TIMEZONES } from "@/lib/timezone";
import { CATEGORIES, type EventCategory } from "@/lib/categories";
import type { ActionState } from "@/lib/actions/action-state";
import type { Database } from "@/lib/supabase/database.types";

const CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value));
const TIMEZONE_VALUES = new Set(TIMEZONES.map((t) => t.value));
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// Genera siempre un colchón de 2 semanas hacia adelante: suficiente para
// que el organizador vea "lo que viene" sin generar de más innecesariamente.
const DAYS_AHEAD = 14;

interface ParsedSeriesForm {
  title: string;
  description: string;
  category: EventCategory;
  venueName: string;
  address: string;
  city: string;
  timezone: string;
  coverPrice: number;
  capacity: number;
  minAge: number | null;
  openWeekdays: number[];
  openTime: string;
  closeTime: string | null;
}

function parseSeriesForm(formData: FormData): { data: ParsedSeriesForm } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const venueName = String(formData.get("venueName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "America/New_York");
  const coverPriceRaw = String(formData.get("coverPrice") ?? "0");
  const capacityRaw = String(formData.get("capacity") ?? "");
  const ageOption = String(formData.get("ageOption") ?? "todas");
  const customAgeRaw = String(formData.get("customAge") ?? "");
  const openTime = String(formData.get("openTime") ?? "").trim();
  const closeTimeRaw = String(formData.get("closeTime") ?? "").trim();
  const openWeekdays = formData
    .getAll("openWeekdays")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

  if (!title) return { error: "Ingresa el nombre del negocio." };
  if (title.length > 120) return { error: "El nombre es demasiado largo (máx. 120 caracteres)." };
  if (!CATEGORY_VALUES.has(category as EventCategory)) return { error: "Selecciona una categoría válida." };
  if (!venueName) return { error: "Ingresa el nombre del lugar." };
  if (!city) return { error: "Ingresa la ciudad." };
  if (!TIMEZONE_VALUES.has(timezone)) return { error: "Selecciona una zona horaria válida." };
  if (openWeekdays.length === 0) return { error: "Selecciona al menos un día en que abren." };
  if (!TIME_RE.test(openTime)) return { error: "Ingresa una hora de apertura válida." };
  if (closeTimeRaw && !TIME_RE.test(closeTimeRaw)) return { error: "Ingresa una hora de cierre válida." };

  const coverPrice = Number(coverPriceRaw);
  if (!Number.isFinite(coverPrice) || coverPrice < 0) return { error: "El precio del cover debe ser 0 o más." };

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

  return {
    data: {
      title,
      description,
      category: category as EventCategory,
      venueName,
      address,
      city,
      timezone,
      coverPrice,
      capacity,
      minAge,
      openWeekdays,
      openTime,
      closeTime: closeTimeRaw || null,
    },
  };
}

export async function createVenueSeries(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseSeriesForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "organizador" && profile.role !== "admin")) {
    return { error: "Tu cuenta no tiene permisos para crear negocios recurrentes." };
  }

  const { data: series, error } = await supabase
    .from("venue_series")
    .insert({
      organizer_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      venue_name: parsed.data.venueName,
      address: parsed.data.address,
      city: parsed.data.city,
      timezone: parsed.data.timezone,
      cover_price: parsed.data.coverPrice,
      capacity: parsed.data.capacity,
      min_age: parsed.data.minAge,
      open_weekdays: parsed.data.openWeekdays,
      open_time: parsed.data.openTime,
      close_time: parsed.data.closeTime,
    })
    .select("id")
    .single();

  if (error || !series) return { error: "No se pudo crear el negocio recurrente." };

  // Genera de una vez los próximos eventos: el organizador no debería ver
  // "vacío" hasta que corra el cron del día siguiente.
  await supabase.rpc("generate_venue_series_events", { p_series_id: series.id, p_days_ahead: DAYS_AHEAD });

  revalidatePath("/organizador/recurrentes");
  redirect(`/organizador/recurrentes/${series.id}`);
}

export async function updateVenueSeries(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const seriesId = String(formData.get("seriesId") ?? "");
  if (!seriesId) return { error: "Negocio inválido." };

  const parsed = parseSeriesForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  // Solo afecta a los eventos que se generen de ahora en adelante: los que
  // ya existen (posiblemente con entradas vendidas) no se tocan acá.
  const { error } = await supabase
    .from("venue_series")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      venue_name: parsed.data.venueName,
      address: parsed.data.address,
      city: parsed.data.city,
      timezone: parsed.data.timezone,
      cover_price: parsed.data.coverPrice,
      capacity: parsed.data.capacity,
      min_age: parsed.data.minAge,
      open_weekdays: parsed.data.openWeekdays,
      open_time: parsed.data.openTime,
      close_time: parsed.data.closeTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seriesId)
    .eq("organizer_id", user.id);

  if (error) return { error: "No se pudo actualizar el negocio recurrente." };

  await supabase.rpc("generate_venue_series_events", { p_series_id: seriesId, p_days_ahead: DAYS_AHEAD });

  revalidatePath(`/organizador/recurrentes/${seriesId}`);
  return { success: "Negocio actualizado." };
}

type VenueSeriesStatus = Database["public"]["Tables"]["venue_series"]["Row"]["status"];

export async function setVenueSeriesStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const seriesId = String(formData.get("seriesId") ?? "");
  const status = String(formData.get("status") ?? "") as VenueSeriesStatus;
  if (!seriesId || (status !== "activa" && status !== "pausada")) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase
    .from("venue_series")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", seriesId)
    .eq("organizer_id", user.id);
  if (error) return { error: "No se pudo actualizar el estado." };

  if (status === "activa") {
    await supabase.rpc("generate_venue_series_events", { p_series_id: seriesId, p_days_ahead: DAYS_AHEAD });
  }

  revalidatePath(`/organizador/recurrentes/${seriesId}`);
  revalidatePath("/organizador/recurrentes");
  return { success: status === "activa" ? "Negocio reactivado." : "Negocio pausado." };
}
