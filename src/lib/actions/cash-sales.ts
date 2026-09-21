"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Debes iniciar sesión para continuar.",
  INVALID_QUANTITY: "Cantidad inválida.",
  TICKET_TYPE_NOT_FOUND: "Tipo de entrada no encontrado.",
  NOT_AUTHORIZED: "No tienes permiso para vender entradas de este evento.",
  EVENT_NOT_ON_SALE: "Este evento no está a la venta en este momento.",
  EVENT_ENDED: "Este evento ya terminó. Ya no se pueden vender entradas.",
  INSUFFICIENT_INVENTORY: "No hay suficientes entradas disponibles para esta cantidad.",
  MISSING_TOKEN_KEY: "No se pudo generar el código del ticket. Intenta de nuevo.",
};

function translateCashSaleError(message: string | undefined): string {
  if (!message) return "Ocurrió un error. Intenta de nuevo.";
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

/**
 * Venta en efectivo en la puerta: el precio y el cupo disponible los
 * recalcula create_cash_sale directamente desde ticket_types (bajo el
 * mismo row lock que usa reserve_tickets), nunca se confía en nada que
 * mande el formulario más allá de qué tipo de entrada y cuántas. La orden
 * nace ya 'pagado' (no hay pasarela async que confirmar) y los tickets
 * salen con el mismo QR/token que cualquier venta online.
 */
export async function createCashSale(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "");
  const quantity = Number(formData.get("quantity") ?? "1");

  if (!ticketTypeId) return { error: "Tipo de entrada inválido." };
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Cantidad inválida." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_cash_sale", {
    p_ticket_type_id: ticketTypeId,
    p_quantity: quantity,
  });

  if (error || !data || data.length === 0) return { error: translateCashSaleError(error?.message) };

  redirect(`/ordenes/${data[0]!.order_id}?pago=exito`);
}
