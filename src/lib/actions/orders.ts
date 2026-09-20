"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Debes iniciar sesión para continuar.",
  INVALID_QUANTITY: "Cantidad inválida.",
  TICKET_TYPE_NOT_FOUND: "Tipo de entrada no encontrado.",
  EVENT_NOT_ON_SALE: "Este evento no está a la venta en este momento.",
  EXCEEDS_MAX_PER_BUYER: "Superas el máximo de entradas permitido por comprador para este tipo de entrada.",
  INSUFFICIENT_INVENTORY: "No hay suficientes entradas disponibles. Otra persona pudo haberlas tomado justo ahora.",
  ORDER_NOT_FOUND: "Orden no encontrada.",
  NOT_OWNER: "Esta orden no te pertenece.",
  ORDER_NOT_PENDING: "Esta orden ya no está pendiente.",
  ORDER_EXPIRED: "La reserva expiró. Vuelve a intentarlo.",
  ORDER_NOT_CANCELLABLE: "Esta orden ya no se puede cancelar.",
};

function translateOrderError(message: string | undefined): string {
  if (!message) return "Ocurrió un error. Intenta de nuevo.";
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

export async function reserveTickets(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "");
  const quantity = Number(formData.get("quantity") ?? "1");

  if (!ticketTypeId) return { error: "Tipo de entrada inválido." };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Cantidad inválida." };

  const supabase = await createClient();
  // Toda la lógica de inventario/atomicidad vive en la función de Postgres
  // reserve_tickets (row lock + chequeo de límite por comprador). Este
  // action es solo un wrapper delgado.
  const { data, error } = await supabase.rpc("reserve_tickets", {
    p_ticket_type_id: ticketTypeId,
    p_quantity: quantity,
  });

  if (error || !data) return { error: translateOrderError(error?.message) };

  revalidatePath(`/comprar/${ticketTypeId}`);
  redirect(`/ordenes/${data.id}`);
}

export async function cancelOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "Orden inválida." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", { p_order_id: orderId });
  if (error) return { error: translateOrderError(error.message) };

  revalidatePath(`/ordenes/${orderId}`);
  return { success: "Reserva cancelada." };
}
