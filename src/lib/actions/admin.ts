"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";
import type { Database } from "@/lib/supabase/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type EventStatus = Database["public"]["Enums"]["event_status"];
type TicketStatus = Database["public"]["Enums"]["ticket_status"];

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHORIZED: "No tienes permiso para hacer esto.",
  CANNOT_MODIFY_SELF: "No puedes cambiar tu propio rol desde acá.",
  USER_NOT_FOUND: "Usuario no encontrado.",
  EVENT_NOT_FOUND: "Evento no encontrado.",
  TICKET_NOT_FOUND: "Ticket no encontrado.",
  REASON_REQUIRED: "Tienes que escribir un motivo.",
};

function translate(message: string | undefined): string {
  if (!message) return "Ocurrió un error. Intenta de nuevo.";
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

export async function adminSetUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = String(formData.get("userId") ?? "");
  const newRole = String(formData.get("newRole") ?? "") as UserRole;
  if (!userId || !newRole) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_role", { p_user_id: userId, p_new_role: newRole });
  if (error) return { error: translate(error.message) };

  revalidatePath("/admin/usuarios");
  return { success: "Rol actualizado." };
}

export async function adminSetEventStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  const newStatus = String(formData.get("newStatus") ?? "") as EventStatus;
  if (!eventId || !newStatus) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_event_status", { p_event_id: eventId, p_new_status: newStatus });
  if (error) return { error: translate(error.message) };

  revalidatePath("/admin/eventos");
  return { success: "Evento actualizado." };
}

export async function adminPauseOrganizerEvents(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const organizerId = String(formData.get("organizerId") ?? "");
  if (!organizerId) return { error: "Organizador inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_pause_organizer_events", { p_organizer_id: organizerId });
  if (error) return { error: translate(error.message) };

  revalidatePath("/admin/organizadores");
  revalidatePath("/admin/eventos");
  return { success: `${data?.length ?? 0} evento(s) pausado(s).` };
}

export async function adminForceTicketStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  const newStatus = String(formData.get("newStatus") ?? "") as TicketStatus;
  const reason = String(formData.get("reason") ?? "");
  if (!ticketId || !newStatus) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_force_ticket_status", {
    p_ticket_id: ticketId,
    p_new_status: newStatus,
    p_reason: reason,
  });
  if (error) return { error: translate(error.message) };

  revalidatePath("/admin/tickets");
  return { success: "Ticket actualizado." };
}
