import "server-only";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import type { Database } from "@/lib/supabase/database.types";

export type OrganizerStripeAccountRow = Database["public"]["Tables"]["organizer_stripe_accounts"]["Row"];

export interface PayoutInfo {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string;
  created: string;
}

/** Estado de la cuenta Stripe Connect del organizador autenticado (o null si no ha empezado el onboarding). */
export async function getMyStripeAccount(): Promise<OrganizerStripeAccountRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("organizer_stripe_accounts")
    .select("*")
    .eq("organizer_id", user.id)
    .maybeSingle();
  return data;
}

/**
 * Payouts reales, leídos en vivo de Stripe (con el header Stripe-Account
 * "actuando como" la cuenta conectada del organizador) — no se guarda una
 * copia local: Stripe es la única fuente de verdad para cuándo y cuánto se
 * le pagó de verdad al organizador.
 */
export async function getOrganizerPayouts(stripeAccountId: string): Promise<PayoutInfo[]> {
  try {
    const payouts = await stripe.payouts.list({ limit: 10 }, { stripeAccount: stripeAccountId });
    return payouts.data.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      arrivalDate: new Date(p.arrival_date * 1000).toISOString(),
      created: new Date(p.created * 1000).toISOString(),
    }));
  } catch {
    return [];
  }
}
