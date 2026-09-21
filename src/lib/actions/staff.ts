"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim() || null;

  if (!EMAIL_RE.test(email)) return { error: "Ingresa un correo válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "organizador" && profile.role !== "admin")) {
    return { error: "Tu cuenta no tiene permisos para invitar staff." };
  }

  let eventTitleSnapshot: string | null = null;
  if (eventId) {
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .eq("organizer_id", user.id)
      .maybeSingle();
    if (!event) return { error: "Ese evento no te pertenece." };
    eventTitleSnapshot = event.title;
  }

  const { data: invitee, error: resolveError } = await supabase
    .rpc("resolve_staff_invitee", { p_email: email })
    .maybeSingle();
  if (resolveError || !invitee) {
    return { error: "No encontramos una cuenta de TTG con ese correo. Pídele que se registre primero." };
  }
  if (invitee.user_id === user.id) return { error: "No puedes invitarte a ti mismo." };

  let existingQuery = supabase
    .from("event_staff")
    .select("id")
    .eq("organizer_id", user.id)
    .eq("staff_user_id", invitee.user_id)
    .in("status", ["pendiente", "aceptada"]);
  existingQuery = eventId ? existingQuery.eq("event_id", eventId) : existingQuery.is("event_id", null);
  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) return { error: "Ya tienes una invitación pendiente o activa con esa persona para este alcance." };

  const [{ data: organizerProfile }, { data: baseProfile }] = await Promise.all([
    supabase.from("organizer_profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);
  const organizerDisplayName = organizerProfile?.display_name || baseProfile?.full_name || "Organizador";

  const { error: insertError } = await supabase.from("event_staff").insert({
    organizer_id: user.id,
    event_id: eventId,
    staff_user_id: invitee.user_id,
    staff_display_name_snapshot: invitee.display_name || "Sin nombre",
    organizer_display_name_snapshot: organizerDisplayName,
    event_title_snapshot: eventTitleSnapshot,
  });
  if (insertError) return { error: "No se pudo enviar la invitación." };

  revalidatePath("/organizador/staff");
  return { success: `Invitación enviada a ${invitee.display_name || email}.` };
}

export async function revokeStaffInvite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const invitationId = String(formData.get("invitationId") ?? "");
  if (!invitationId) return { error: "Invitación inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase
    .from("event_staff")
    .update({ status: "revocada" })
    .eq("id", invitationId)
    .eq("organizer_id", user.id);
  if (error) return { error: "No se pudo revocar el acceso." };

  revalidatePath("/organizador/staff");
  return { success: "Acceso revocado." };
}

export async function respondStaffInvitation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const invitationId = String(formData.get("invitationId") ?? "");
  const accept = String(formData.get("accept") ?? "") === "true";
  if (!invitationId) return { error: "Invitación inválida." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_staff_invitation", {
    p_invitation_id: invitationId,
    p_accept: accept,
  });
  if (error) return { error: "No se pudo responder la invitación. Puede que ya no esté disponible." };

  revalidatePath("/invitaciones");
  return { success: accept ? "Invitación aceptada." : "Invitación rechazada." };
}
