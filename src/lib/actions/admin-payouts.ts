"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPaypalPayout, getPaypalPayoutStatus } from "@/lib/paypal/server";
import type { ActionState } from "@/lib/actions/action-state";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Estas acciones disparan pagos reales (PayPal) o registran un pago que ya
 * se hizo a mano (ATH Móvil): la política RLS de organizer_payouts ya
 * exige rol admin para insertar/actualizar, pero eso no alcanza acá — si
 * no se verifica el rol ANTES de llamar a la API de PayPal, alguien sin
 * permiso podría igual disparar el payout real y solo fallar al guardar
 * el registro en la base de datos (dinero ya enviado, sin rastro).
 */
async function requireAdmin(): Promise<
  { ok: true; supabase: SupabaseServerClient; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { ok: false, error: "No tienes permiso para hacer esto." };

  return { ok: true, supabase, userId: user.id };
}

/** Recalculado siempre desde el ledger real; nunca se confía en un monto que venga del formulario. */
async function getPendingBalance(supabase: SupabaseServerClient, organizerId: string): Promise<number> {
  const [{ data: txns }, { data: payouts }] = await Promise.all([
    supabase
      .from("payment_transactions")
      .select("organizer_amount, orders!inner(payout_rail, events!inner(organizer_id))")
      .neq("orders.payout_rail", "stripe")
      .eq("orders.events.organizer_id", organizerId),
    supabase.from("organizer_payouts").select("amount, status").eq("organizer_id", organizerId),
  ]);

  const earned = (txns ?? []).reduce((sum, t) => sum + t.organizer_amount, 0);
  const paid = (payouts ?? []).filter((p) => p.status !== "failed").reduce((sum, p) => sum + p.amount, 0);
  return Math.max(earned - paid, 0);
}

export async function triggerPaypalPayout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const organizerId = String(formData.get("organizerId") ?? "");
  if (!organizerId) return { error: "Organizador inválido." };

  const gate = await requireAdmin();
  if (!gate.ok) return { error: gate.error };
  const { supabase, userId } = gate;

  const { data: settings } = await supabase
    .from("organizer_payout_settings")
    .select("method, paypal_email")
    .eq("organizer_id", organizerId)
    .maybeSingle();
  if (settings?.method !== "paypal" || !settings.paypal_email) {
    return { error: "Este organizador no tiene PayPal configurado." };
  }

  const pendingBalance = await getPendingBalance(supabase, organizerId);
  if (pendingBalance <= 0) return { error: "No hay balance pendiente para este organizador." };

  let payout: { batchId: string; status: string };
  try {
    payout = await createPaypalPayout({
      receiverEmail: settings.paypal_email,
      amountInCents: pendingBalance,
      currency: "USD",
      note: "Pago de ventas de entradas",
      senderItemId: `payout_${organizerId}_${Date.now()}`,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "PayPal rechazó el payout." };
  }

  const { error: insertError } = await supabase.from("organizer_payouts").insert({
    organizer_id: organizerId,
    method: "paypal",
    amount: pendingBalance,
    currency: "usd",
    status: "processing",
    paypal_batch_id: payout.batchId,
    created_by: userId,
  });
  if (insertError) {
    // El dinero ya salió de PayPal: no hay forma segura de "deshacerlo"
    // acá, así que se deja el batch id visible para reconciliar a mano.
    return {
      error: `El payout se envió a PayPal (batch ${payout.batchId}) pero no se pudo registrar en la base de datos. Anótalo para reconciliar a mano.`,
    };
  }

  revalidatePath("/admin/payouts");
  return { success: "Payout enviado a PayPal." };
}

export async function refreshPaypalPayoutStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const payoutId = String(formData.get("payoutId") ?? "");
  if (!payoutId) return { error: "Payout inválido." };

  const gate = await requireAdmin();
  if (!gate.ok) return { error: gate.error };
  const { supabase } = gate;

  const { data: payoutRow } = await supabase
    .from("organizer_payouts")
    .select("id, paypal_batch_id")
    .eq("id", payoutId)
    .maybeSingle();
  if (!payoutRow?.paypal_batch_id) return { error: "Payout no encontrado." };

  let status: "processing" | "completed" | "failed";
  try {
    status = await getPaypalPayoutStatus(payoutRow.paypal_batch_id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo consultar el estado en PayPal." };
  }

  const { error } = await supabase
    .from("organizer_payouts")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
    .eq("id", payoutId);
  if (error) return { error: "No se pudo actualizar el estado." };

  revalidatePath("/admin/payouts");
  return { success: `Estado actualizado: ${status === "completed" ? "completado" : status === "failed" ? "fallido" : "en proceso"}.` };
}

export async function markAthMovilPayoutComplete(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const organizerId = String(formData.get("organizerId") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  if (!organizerId) return { error: "Organizador inválido." };
  if (!reference) return { error: "Ingresa una referencia o número de confirmación del pago." };

  const gate = await requireAdmin();
  if (!gate.ok) return { error: gate.error };
  const { supabase, userId } = gate;

  const pendingBalance = await getPendingBalance(supabase, organizerId);
  const amountDollars = Number(amountRaw);
  const amount =
    amountRaw && Number.isFinite(amountDollars) && amountDollars > 0 ? Math.round(amountDollars * 100) : pendingBalance;
  if (amount <= 0) return { error: "No hay balance pendiente para este organizador." };
  if (amount > pendingBalance) return { error: "El monto no puede ser mayor al balance pendiente." };

  const { error } = await supabase.from("organizer_payouts").insert({
    organizer_id: organizerId,
    method: "ath_movil",
    amount,
    currency: "usd",
    status: "completed",
    reference,
    created_by: userId,
    completed_at: new Date().toISOString(),
  });
  if (error) return { error: "No se pudo registrar el pago." };

  revalidatePath("/admin/payouts");
  return { success: "Pago registrado." };
}
