"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";
import type { Database } from "@/lib/supabase/database.types";

type PayoutMethod = Database["public"]["Enums"]["payout_method"];
const METHODS = new Set<PayoutMethod>(["stripe", "paypal", "ath_movil"]);

// Validación simple, no exhaustiva: alcanza para atajar errores de tipeo
// obvios sin bloquear formatos legítimos que no se previeron acá.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,14}$/;

export async function updatePayoutSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const method = String(formData.get("method") ?? "");
  if (!METHODS.has(method as PayoutMethod)) return { error: "Método de cobro inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  let paypalEmail: string | null = null;
  let athMovilPhone: string | null = null;

  if (method === "paypal") {
    paypalEmail = String(formData.get("paypalEmail") ?? "").trim();
    if (!EMAIL_RE.test(paypalEmail)) return { error: "Ingresa un correo de PayPal válido." };
  }

  if (method === "ath_movil") {
    athMovilPhone = String(formData.get("athMovilPhone") ?? "").trim();
    if (!PHONE_RE.test(athMovilPhone)) return { error: "Ingresa un número de teléfono válido." };
  }

  const { error } = await supabase.from("organizer_payout_settings").upsert(
    {
      organizer_id: user.id,
      method: method as PayoutMethod,
      paypal_email: paypalEmail,
      ath_movil_phone: athMovilPhone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organizer_id" }
  );
  if (error) return { error: "No se pudo guardar tu método de cobro." };

  revalidatePath("/organizador/pagos");
  return { success: "Método de cobro actualizado." };
}
