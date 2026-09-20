"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { stripe } from "@/lib/stripe/server";
import { toStripeAmount, computePlatformFee } from "@/lib/payments/fees";
import { getOrderForBuyer } from "@/lib/tickets";
import type { ActionState } from "@/lib/actions/action-state";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Crea (si no existe) la cuenta Express del organizador y lo manda al
 * onboarding hospedado por Stripe. charges_enabled / payouts_enabled los
 * confirma después el webhook account.updated: nunca se asumen habilitados
 * solo porque el organizador "volvió" del flujo de Stripe.
 */
export async function startStripeOnboarding(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: existing } = await supabase
    .from("organizer_stripe_accounts")
    .select("stripe_account_id")
    .eq("organizer_id", user.id)
    .maybeSingle();

  let accountId = existing?.stripe_account_id;

  if (!accountId) {
    const country = String(formData.get("country") ?? "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) return { error: "Selecciona un país válido." };

    let account: { id: string };
    try {
      account = await stripe.accounts.create({
        type: "express",
        country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
    } catch (err) {
      return { error: err instanceof Error ? err.message : "No se pudo crear la cuenta de Stripe." };
    }
    accountId = account.id;

    const { error: insertError } = await supabase
      .from("organizer_stripe_accounts")
      .insert({ organizer_id: user.id, stripe_account_id: accountId });
    if (insertError) return { error: "No se pudo guardar la cuenta de Stripe." };
  }

  let link: { url: string };
  try {
    link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl()}/organizador/pagos`,
      return_url: `${siteUrl()}/organizador/pagos`,
      type: "account_onboarding",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo iniciar el onboarding de Stripe." };
  }

  redirect(link.url);
}

/**
 * Crea la Checkout Session real para una orden 'pendiente' y redirige al
 * checkout hospedado por Stripe. NO marca nada como pagado aquí: eso lo
 * hace exclusivamente el webhook cuando Stripe confirma el pago real.
 */
export async function createCheckoutSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { error: "Orden inválida." };

  const result = await getOrderForBuyer(orderId);
  if (!result) return { error: "Orden no encontrada." };
  const { order, ticketType, event } = result;

  const isExpired = !!order.expires_at && new Date(order.expires_at).getTime() <= Date.now();
  if (order.status !== "pendiente" || isExpired) {
    return { error: "Esta reserva ya no está pendiente de pago." };
  }

  // Lectura con service_role: si el comprador pudiera leer directamente la
  // cuenta Stripe del organizador estaría expuesta a RLS pensada para el
  // propio organizador, no para compradores. Acá solo se usa para decidir
  // si se puede cobrar, nunca se devuelve al cliente.
  const admin = createServiceRoleClient();
  const { data: stripeAccount } = await admin
    .from("organizer_stripe_accounts")
    .select("stripe_account_id, charges_enabled")
    .eq("organizer_id", event.organizer_id)
    .maybeSingle();

  if (!stripeAccount?.charges_enabled) {
    return { error: "Este organizador todavía no puede recibir pagos. Intenta más tarde." };
  }

  const unitAmount = toStripeAmount(order.unit_price);
  const amountTotal = unitAmount * order.quantity;
  const applicationFeeAmount = computePlatformFee(amountTotal);

  let session: { id: string; url: string | null };
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: order.quantity,
            price_data: {
              currency: "cop",
              unit_amount: unitAmount,
              product_data: { name: `${event.title} · ${ticketType.name}` },
            },
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          transfer_data: { destination: stripeAccount.stripe_account_id },
          metadata: { order_id: order.id },
        },
        metadata: { order_id: order.id },
        success_url: `${siteUrl()}/ordenes/${order.id}?pago=exito`,
        cancel_url: `${siteUrl()}/ordenes/${order.id}?pago=cancelado`,
      },
      // Idempotente: reintentar (doble clic, refresh) no crea una segunda
      // sesión de pago para la misma orden.
      { idempotencyKey: `checkout_${order.id}` }
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo iniciar el pago." };
  }

  if (!session.url) return { error: "Stripe no devolvió una URL de pago." };

  await admin.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);

  redirect(session.url);
}
