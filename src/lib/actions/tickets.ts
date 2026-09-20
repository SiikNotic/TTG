"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { stripe } from "@/lib/stripe/server";
import { toStripeAmount } from "@/lib/payments/fees";
import type { ActionState } from "@/lib/actions/action-state";

const ERROR_MESSAGES: Record<string, string> = {
  TICKET_NOT_FOUND: "Ticket no encontrado.",
  NOT_AUTHORIZED: "No tienes permiso sobre este ticket.",
  TICKET_NOT_ACTIVE: "Este ticket ya no está activo.",
  ORDER_NOT_PAID: "Esta orden no tiene un pago confirmado para reembolsar.",
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

async function setTicketStatus(ticketId: string, status: "cancelled"): Promise<ActionState> {
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

/**
 * Reembolso real: SIEMPRE pasa por la API de Stripe (reverse_transfer +
 * refund_application_fee, para deshacer también la comisión y la
 * transferencia al organizador), nunca un flip directo de estado en la
 * base de datos. El estado del ticket lo actualiza apply_ticket_refund
 * recién después de que Stripe confirma el reembolso.
 */
export async function refundTicket(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_refundable_ticket", { p_ticket_id: ticketId });
  const info = data?.[0];
  if (error || !info) return { error: translateTicketError(error?.message) };

  const amount = toStripeAmount(info.unit_price);
  const platformFeeRefunded = info.quantity > 0 ? Math.floor((info.platform_fee_amount ?? 0) / info.quantity) : 0;
  // reverse_transfer/refund_application_fee solo son válidos para órdenes
  // cobradas por el riel 'stripe' (única que transfirió a una cuenta
  // Connect y descontó un application_fee real). Para paypal/ath_movil el
  // charge fue plano a la plataforma: no hay transferencia ni fee de
  // aplicación que revertir, así que es un refund normal.
  const isStripeRail = info.payout_rail === "stripe";

  let refund: { id: string; status: string | null };
  try {
    refund = await stripe.refunds.create(
      {
        payment_intent: info.stripe_payment_intent_id ?? undefined,
        amount,
        ...(isStripeRail ? { reverse_transfer: true, refund_application_fee: true } : {}),
        metadata: { ticket_id: ticketId },
      },
      { idempotencyKey: `refund_ticket_${ticketId}` }
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo procesar el reembolso en Stripe." };
  }

  // 'succeeded' síncrono (lo normal para tarjetas): se confirma ya mismo.
  // Cualquier otro estado ('pending', típico de métodos async) lo termina
  // de confirmar el webhook charge.refunded — nunca se marca reembolsado
  // solo porque Stripe aceptó la solicitud.
  if (refund.status === "succeeded") {
    const admin = createServiceRoleClient();
    const { error: applyError } = await admin.rpc("apply_ticket_refund", {
      p_ticket_id: ticketId,
      p_stripe_refund_id: refund.id,
      p_amount: amount,
      p_platform_fee_refunded: platformFeeRefunded,
    });
    if (applyError) {
      return { error: "El reembolso se procesó en Stripe pero no se pudo actualizar la base de datos." };
    }
    revalidatePath(`/tickets/${ticketId}`);
    return { success: "Ticket reembolsado. El cupo vuelve a estar disponible." };
  }

  return { success: "Reembolso solicitado a Stripe. Se confirmará en breve." };
}

export async function cancelTicket(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };
  const result = await setTicketStatus(ticketId, "cancelled");
  return result.error ? result : { success: "Ticket cancelado. El cupo vuelve a estar disponible." };
}

export async function getTicketQrPayload(ticketId: string): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ticket_qr_payload", { p_ticket_id: ticketId });
  if (error || !data) return { error: translateTicketError(error?.message) };
  return { token: data };
}
