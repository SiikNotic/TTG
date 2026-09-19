"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/errors";
import { isSafeNextPath } from "@/lib/site-url";
import type { ActionState } from "@/lib/actions/auth";

export interface MfaEnrollResult {
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}

/** Inicia la inscripción de un factor TOTP (app autenticadora). */
export async function enrollMfa(): Promise<MfaEnrollResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Autenticador ${new Date().toLocaleDateString("es-CO")}`,
  });

  if (error) return { error: translateAuthError(error.message) };

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/** Confirma la inscripción verificando el primer código generado. */
export async function verifyMfaEnrollment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  if (!factorId || !code) return { error: "Ingresa el código de 6 dígitos." };

  const supabase = await createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError) return { error: translateAuthError(challengeError.message) };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (error) return { error: "Código incorrecto. Intenta de nuevo." };

  revalidatePath("/cuenta");
  return { success: "Verificación en dos pasos activada." };
}

export async function unenrollMfa(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const factorId = String(formData.get("factorId") ?? "");
  if (!factorId) return { error: "Factor inválido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: translateAuthError(error.message) };

  revalidatePath("/cuenta");
  return { success: "Verificación en dos pasos desactivada." };
}

/** Completa el desafío MFA al entrar a una ruta que exige aal2 (p. ej. /admin). */
export async function challengeMfa(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/admin");

  if (!factorId) return { error: "No encontramos un factor activo. Vuelve a iniciar sesión." };
  if (!code) return { error: "Ingresa el código de 6 dígitos." };

  const supabase = await createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError) return { error: translateAuthError(challengeError.message) };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (error) return { error: "Código incorrecto." };

  redirect(isSafeNextPath(next) ? next : "/admin");
}
