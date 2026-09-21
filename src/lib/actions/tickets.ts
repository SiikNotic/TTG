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
  TICKET_NOT_REFUNDABLE: "Este ticket no es elegible para reembolso.",
  ORDER_NOT_PAID: "Esta orden no tiene un pago confirmado para reembolsar.",
  INVALID_TARGET_STATUS: "Acción inválida.",
  INVALID_TOKEN: "Código inválido.",
  NO_TOKEN: "Este ticket no tiene un código para mostrar.",
  RECONCILIATION_NOT_FOUND: "No se encontró el registro de ese reembolso.",
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
 * base de datos.
 *
 * Elegible tanto un ticket 'active' como uno 'cancelled' (por ejemplo, un
 * ticket pagado cuyo evento se canceló: cascade_event_cancellation lo pasa
 * a 'cancelled', pero el dinero sigue cobrado hasta que esto se ejecuta).
 *
 * En cuanto Stripe confirma el refund, se registra de inmediato en
 * stripe_refund_reconciliation (record_stripe_refund) ANTES de intentar
 * aplicarlo al ticket: así, si el siguiente paso falla por lo que sea (red,
 * timeout, deploy a mitad de camino), el hecho de que Stripe ya devolvió el
 * dinero queda guardado de forma durable y reconciliable — nunca depende
 * únicamente de que este request termine con éxito. apply_ticket_refund
 * (a través de apply_stripe_refund_reconciliation) es quien de verdad
 * cambia el estado del ticket, y sigue siendo lo único que lo hace.
 */
export async function refundTicket(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { error: "Ticket inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

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

  // 'pending' (típico de métodos async): todavía no hay nada confirmado de
  // parte de Stripe. El webhook charge.refunded se encarga de registrar y
  // aplicar el reembolso cuando Stripe lo confirme — mismo mecanismo que
  // se usa más abajo, no uno distinto.
  if (refund.status !== "succeeded") {
    return { success: "Reembolso solicitado a Stripe. Se confirmará en breve." };
  }

  // A partir de acá el dinero YA se devolvió de verdad en Stripe.
  const admin = createServiceRoleClient();
  const { error: recordError } = await admin.rpc("record_stripe_refund", {
    p_stripe_refund_id: refund.id,
    p_stripe_payment_intent_id: info.stripe_payment_intent_id,
    p_order_id: info.order_id,
    p_ticket_ids: [ticketId],
    p_amount: amount,
    p_platform_fee_refunded: platformFeeRefunded,
    p_initiated_by: user.id,
    p_source: "app",
  });
  if (recordError) {
    // No se pudo ni registrar en TTG. El webhook charge.refunded va a
    // llegar de todas formas y va a encontrar la metadata ticket_id que
    // Stripe sí guardó, así que lo recupera por esa vía sin intervención.
    return {
      success:
        "El reembolso se procesó en Stripe. Puede tardar unos segundos en reflejarse en TTG; si no se actualiza, recarga esta página.",
    };
  }

  const { error: applyError } = await admin.rpc("apply_stripe_refund_reconciliation", {
    p_stripe_refund_id: refund.id,
  });
  if (applyError) {
    // El registro del paso anterior ya quedó guardado y es reconciliable:
    // el webhook lo terminará de aplicar cuando llegue, o el organizador
    // puede reintentar manualmente desde "Reintentar sincronización".
    return {
      success:
        'El reembolso se procesó en Stripe y quedó registrado. Está sincronizando el estado del ticket; si en unos segundos no se actualiza, usa "Reintentar sincronización" en el panel del evento.',
    };
  }

  revalidatePath(`/tickets/${ticketId}`);
  return { success: "Ticket reembolsado. El cupo vuelve a estar disponible." };
}

/**
 * Reintento manual de sincronización: para el caso (raro) en que el propio
 * request de refundTicket() se cayó después de que record_stripe_refund ya
 * dejó el reembolso registrado, pero antes/mientras apply_stripe_refund_
 * reconciliation lo aplicaba. No crea ningún refund nuevo en Stripe — solo
 * reintenta aplicar uno que ya está confirmado y guardado.
 */
export async function retryRefundReconciliation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const stripeRefundId = String(formData.get("stripeRefundId") ?? "");
  if (!stripeRefundId) return { error: "Referencia inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  // La policy stripe_refund_reconciliation_select_organizer_or_admin es lo
  // que realmente autoriza esto: si la fila no pertenece a un evento del
  // organizador (o no es admin), esta lectura simplemente no la encuentra.
  const { data: row } = await supabase
    .from("stripe_refund_reconciliation")
    .select("stripe_refund_id")
    .eq("stripe_refund_id", stripeRefundId)
    .maybeSingle();
  if (!row) return { error: "No tienes permiso o el registro no existe." };

  const admin = createServiceRoleClient();
  const { error } = await admin.rpc("apply_stripe_refund_reconciliation", { p_stripe_refund_id: stripeRefundId });
  if (error) return { error: translateTicketError(error.message) };

  revalidatePath("/organizador");
  return { success: "Sincronizado correctamente." };
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
