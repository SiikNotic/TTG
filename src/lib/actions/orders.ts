"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/action-state";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Debes iniciar sesión para continuar.",
  INVALID_QUANTITY: "Cantidad inválida.",
  TICKET_TYPE_NOT_FOUND: "Tipo de entrada no encontrado.",
  EVENT_NOT_ON_SALE: "Este evento no está a la venta en este momento.",
  EVENT_ENDED: "Este evento ya terminó. Ya no se pueden comprar entradas.",
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

/**
 * Confirma una orden gratis (unit_price = 0) sin pasar por Stripe: no
 * tiene sentido pedirle tarjeta a nadie ni exigirle al organizador tener
 * un método de cobro configurado para regalar entradas. Nunca se confía
 * en el precio "gratis" desde el formulario: se relee la orden con el
 * cliente del propio comprador (RLS ya garantiza que es la suya) y se
 * verifica unit_price = 0 en el servidor antes de emitir nada.
 */
export async function confirmFreeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "Orden inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, buyer_id, unit_price, status, expires_at")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) return { error: "Orden no encontrada." };
  if (Number(order.unit_price) !== 0) return { error: "Esta orden no es gratuita." };

  const isExpired = !!order.expires_at && new Date(order.expires_at).getTime() <= Date.now();
  if (order.status !== "pendiente" || isExpired) {
    return { error: "Esta reserva ya no está pendiente de confirmación." };
  }

  // confirm_order_paid es la misma función que usa el webhook de Stripe;
  // acá se llama con null en los campos de Stripe (no hubo cobro real) para
  // que el ticket quede correctamente marcado como "no pagado por Stripe" —
  // eso es lo que evita que un reembolso intente después una llamada real a
  // la API de Stripe sobre una orden que nunca pasó por ahí.
  const admin = createServiceRoleClient();
  const { error } = await admin.rpc("confirm_order_paid", {
    p_order_id: orderId,
    p_stripe_payment_intent_id: null as unknown as string,
    p_stripe_charge_id: null as unknown as string,
    p_amount_total: 0,
    p_application_fee_amount: 0,
  });
  if (error) return { error: "No se pudo confirmar la entrada." };

  revalidatePath(`/ordenes/${orderId}`);
  redirect(`/ordenes/${orderId}?pago=exito`);
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
