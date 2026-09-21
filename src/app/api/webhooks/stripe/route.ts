import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { computePlatformFee, toStripeAmount } from "@/lib/payments/fees";

export const runtime = "nodejs";

/**
 * Único punto de entrada que puede confirmar un pago real. Nunca se
 * marca una orden como pagada porque el frontend lo diga: solo un evento
 * de Stripe con firma verificada llega hasta acá.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("stripe webhook: firma inválida", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Fast-path de deduplicación: si ya se registró este event.id, no hay
  // nada más que hacer. La idempotencia "real" (la que importa si esta
  // fila no llegó a insertarse por un error a mitad de camino) vive en
  // cada función de Postgres, que es segura de volver a llamar.
  const { data: alreadyProcessed } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(event, supabase);
  } catch (err) {
    // No se registra el evento como procesado: al devolver un error,
    // Stripe reintenta la entrega más tarde y el manejo puede completarse
    // (cada rama de abajo es segura de reintentar).
    console.error("stripe webhook: error procesando evento", event.type, event.id, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  const { error: dedupeError } = await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    type: event.type,
  });
  // 23505 = unique_violation: otra entrega concurrente del mismo evento ya
  // lo registró mientras este request procesaba. No es un error real.
  if (dedupeError && dedupeError.code !== "23505") {
    console.error("stripe webhook: no se pudo registrar el evento procesado", event.id, dedupeError);
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event, supabase: ReturnType<typeof createServiceRoleClient>) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") return;
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.error("stripe webhook: checkout.session.completed sin order_id en metadata", session.id);
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

      // Solo el riel 'stripe' transfiere de verdad a una cuenta Connect (ahí
      // sí existe un application_fee_amount real que Stripe cobró). Para
      // paypal/ath_movil el cobro es un charge plano a la plataforma —
      // Stripe no le resta ninguna comisión de aplicación — así que la
      // comisión de la plataforma se calcula acá mismo para que el ledger
      // (payment_transactions.organizer_amount) refleje correctamente
      // cuánto le corresponde al organizador, aunque el dinero no se haya
      // movido automáticamente.
      const payoutRail = session.metadata?.payout_rail === "stripe" ? "stripe" : "platform_held";

      let chargeId: string | undefined;
      let applicationFeeAmount = 0;
      if (paymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
        const latestCharge = pi.latest_charge;
        chargeId = typeof latestCharge === "string" ? latestCharge : latestCharge?.id;
        applicationFeeAmount =
          payoutRail === "stripe" ? (pi.application_fee_amount ?? 0) : computePlatformFee(session.amount_total ?? 0);
      }

      const { data: tickets, error } = await supabase.rpc("confirm_order_paid", {
        p_order_id: orderId,
        p_stripe_payment_intent_id: paymentIntentId ?? "",
        p_stripe_charge_id: chargeId ?? "",
        p_amount_total: session.amount_total ?? 0,
        p_application_fee_amount: applicationFeeAmount,
      });

      if (error) throw new Error(`confirm_order_paid: ${error.message}`);
      if (!tickets || tickets.length === 0) {
        // Puede pasar si la orden ya estaba 'cancelado' cuando llegó el
        // pago real (ver comentario en confirm_order_paid): dinero cobrado
        // sin tickets emitidos. Requiere revisión manual (reembolso).
        console.error("stripe webhook: confirm_order_paid no emitió tickets, revisar manualmente", orderId);
      }
      return;
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (!orderId) return;
      const { error } = await supabase.rpc("mark_order_payment_failed", { p_order_id: orderId });
      if (error) throw new Error(`mark_order_payment_failed: ${error.message}`);
      return;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const refunds = charge.refunds?.data ?? [];
      const chargePaymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : (charge.payment_intent?.id ?? null);

      for (const refund of refunds) {
        if (refund.status !== "succeeded") continue;

        // A2: no depender únicamente de refund.metadata.ticket_id (solo la
        // pone refundTicket() — un refund creado directo en el Dashboard de
        // Stripe, o por cualquier otra vía, nunca la trae). Se intenta
        // resolver el/los ticket(s) de forma inequívoca; si no se puede,
        // record_stripe_refund lo deja registrado como 'ambiguous' y NO se
        // toca ningún ticket al azar.
        let ticketIds: string[] | null = null;
        let orderId: string | null = null;

        const metadataTicketId = refund.metadata?.ticket_id ?? null;
        if (metadataTicketId) {
          const { data: ticketRow } = await supabase
            .from("tickets")
            .select("order_id")
            .eq("id", metadataTicketId)
            .maybeSingle();
          // Solo se confía en la metadata si de verdad resuelve a un ticket
          // real; si no, se cae al camino de resolución por payment_intent
          // en vez de guardar un ticket_id que no existe.
          if (ticketRow) {
            ticketIds = [metadataTicketId];
            orderId = ticketRow.order_id;
          }
        }

        if (!ticketIds && chargePaymentIntentId) {
          const { data: order } = await supabase
            .from("orders")
            .select("id, unit_price")
            .eq("stripe_payment_intent_id", chargePaymentIntentId)
            .maybeSingle();

          if (order) {
            orderId = order.id;
            const { data: refundableTickets } = await supabase
              .from("tickets")
              .select("id")
              .eq("order_id", order.id)
              .in("status", ["active", "cancelled"]);
            const candidates = refundableTickets ?? [];
            const perTicketAmount = toStripeAmount(order.unit_price);

            if (candidates.length === 1) {
              // Único ticket de la orden que todavía puede reembolsarse:
              // inequívoco sin importar el monto exacto del refund.
              ticketIds = [candidates[0]!.id];
            } else if (
              candidates.length > 1 &&
              perTicketAmount > 0 &&
              refund.amount === perTicketAmount * candidates.length
            ) {
              // El monto cubre exactamente TODOS los tickets restantes de
              // la orden: también inequívoco (reembolso del saldo completo).
              ticketIds = candidates.map((t) => t.id);
            }
            // Cualquier otro caso (0 candidatos, o un monto parcial que no
            // identifica cuáles tickets específicos): queda ambiguo a
            // propósito, no se adivina.
          }
        }

        const { error: recordError } = await supabase.rpc("record_stripe_refund", {
          p_stripe_refund_id: refund.id,
          p_stripe_payment_intent_id: chargePaymentIntentId ?? undefined,
          p_order_id: orderId ?? undefined,
          p_ticket_ids: ticketIds ?? undefined,
          p_amount: refund.amount,
          p_platform_fee_refunded: 0,
          p_source: "webhook",
        });
        if (recordError) throw new Error(`record_stripe_refund: ${recordError.message}`);

        const { error: applyError } = await supabase.rpc("apply_stripe_refund_reconciliation", {
          p_stripe_refund_id: refund.id,
        });
        if (applyError) throw new Error(`apply_stripe_refund_reconciliation: ${applyError.message}`);
      }
      return;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
      if (!chargeId) return;

      const charge = await stripe.charges.retrieve(chargeId);
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!paymentIntentId) return;

      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      if (!order) return;

      const { error } = await supabase.rpc("apply_order_dispute", {
        p_order_id: order.id,
        p_stripe_dispute_id: dispute.id,
        p_amount: dispute.amount,
      });
      if (error) throw new Error(`apply_order_dispute: ${error.message}`);
      return;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const { error } = await supabase
        .from("organizer_stripe_accounts")
        .update({
          charges_enabled: account.charges_enabled ?? false,
          payouts_enabled: account.payouts_enabled ?? false,
          details_submitted: account.details_submitted ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_account_id", account.id);
      if (error) throw new Error(`organizer_stripe_accounts update: ${error.message}`);
      return;
    }

    default:
      return;
  }
}
