"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";
import type { TicketCheckResult } from "@/lib/actions/ticket-check-state";

export type { TicketCheckResult } from "@/lib/actions/ticket-check-state";

const ERROR_MESSAGES: Record<string, string> = {
  TICKET_NOT_FOUND: "Ticket no encontrado.",
  NOT_AUTHORIZED: "No tienes permiso sobre este ticket.",
  TICKET_NOT_ACTIVE: "Este ticket ya no está activo.",
  INVALID_TARGET_STATUS: "Acción inválida.",
  INVALID_TOKEN: "Código inválido.",
  NO_TOKEN: "Este ticket no tiene un código para mostrar.",
};

function translateTicketError(message: string | undefined): string {
  if (!message) return "Ocurrió un error. Intenta de nuevo.";
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

async function setTicketStatus(ticketId: string, status: "refunded" | "cancelled" | "used"): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_ticket_status_by_organizer", {
    p_ticket_id: ticketId,
    p_new_status: status,
  });

  if (error || !data) return { error: translateTicketError(error?.message) };

  revalidatePath(`/organizador/eventos/${data.event_id}`);
  revalidatePath(`/tickets/${ticketId}`);
  return { success: "Listo." };
}

export async function refundTicket(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };
  const result = await setTicketStatus(ticketId, "refunded");
  return result.error ? result : { success: "Ticket reembolsado. El cupo vuelve a estar disponible." };
}

export async function cancelTicket(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };
  const result = await setTicketStatus(ticketId, "cancelled");
  return result.error ? result : { success: "Ticket cancelado. El cupo vuelve a estar disponible." };
}

export async function markTicketUsed(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };
  const result = await setTicketStatus(ticketId, "used");
  return result.error ? result : { success: "Ingreso registrado." };
}

/** Chequeo de solo lectura: resuelve el token y devuelve el ticket, sin mutarlo. */
export async function checkTicketToken(_prev: TicketCheckResult, formData: FormData): Promise<TicketCheckResult> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Ingresa o escanea un código." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_ticket_token", { p_raw_token: token });

  if (error || !data) return { error: translateTicketError(error?.message) };
  return { ticket: data };
}

export async function getTicketQrPayload(ticketId: string): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ticket_qr_payload", { p_ticket_id: ticketId });
  if (error || !data) return { error: translateTicketError(error?.message) };
  return { token: data };
}
