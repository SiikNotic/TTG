import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type PayoutMethod = Database["public"]["Enums"]["payout_method"];

export interface OrganizerPayoutSettings {
  method: PayoutMethod;
  paypalEmail: string | null;
  athMovilPhone: string | null;
}

const DEFAULT_SETTINGS: OrganizerPayoutSettings = { method: "stripe", paypalEmail: null, athMovilPhone: null };

/** Sin fila en organizer_payout_settings, el organizador está en 'stripe' (el default histórico). */
export async function getMyPayoutSettings(): Promise<OrganizerPayoutSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_SETTINGS;

  const { data } = await supabase
    .from("organizer_payout_settings")
    .select("method, paypal_email, ath_movil_phone")
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!data) return DEFAULT_SETTINGS;

  return { method: data.method, paypalEmail: data.paypal_email, athMovilPhone: data.ath_movil_phone };
}

export interface PayoutHistoryRow {
  id: string;
  method: PayoutMethod;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
  completedAt: string | null;
}

/**
 * Balance pendiente de pago por fuera de Stripe: lo que la plataforma le
 * debe al organizador por órdenes cobradas con payout_rail != 'stripe'
 * (ese dinero quedó en el balance de la propia plataforma, no en una
 * cuenta Connect), menos lo que ya se le pagó (organizer_payouts en
 * pending/processing/completed — un payout "processing" ya cuenta para no
 * disparar el mismo pago dos veces). Nunca se guarda un balance aparte:
 * siempre se recalcula desde el ledger real.
 */
export async function getMyPayoutBalance(): Promise<{ pendingBalance: number; history: PayoutHistoryRow[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { pendingBalance: 0, history: [] };

  const [{ data: txns }, { data: payouts }] = await Promise.all([
    supabase
      .from("payment_transactions")
      .select("organizer_amount, orders!inner(payout_rail)")
      .neq("orders.payout_rail", "stripe"),
    supabase
      .from("organizer_payouts")
      .select("id, method, amount, currency, status, reference, created_at, completed_at")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const earned = (txns ?? []).reduce((sum, t) => sum + t.organizer_amount, 0);
  const paidOut = (payouts ?? [])
    .filter((p) => p.status !== "failed")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    pendingBalance: Math.max(earned - paidOut, 0),
    history: (payouts ?? []).map((p) => ({
      id: p.id,
      method: p.method,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      reference: p.reference,
      createdAt: p.created_at,
      completedAt: p.completed_at,
    })),
  };
}
