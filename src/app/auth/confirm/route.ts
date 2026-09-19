import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSafeNextPath } from "@/lib/site-url";

/**
 * Endpoint al que redirigen los links de email de Supabase (confirmación
 * de registro y recuperación de contraseña). Soporta dos formatos, según
 * si el proyecto usa la plantilla de correo por defecto o una
 * personalizada (esto último requiere SMTP propio, no disponible en el
 * plan free sin configurarlo):
 *
 * - `?code=...`        → plantilla por defecto de Supabase (PKCE). Es el
 *                         caso normal sin tocar nada en el Dashboard.
 * - `?token_hash=...`  → plantilla personalizada con {{ .TokenHash }},
 *                         para cuando sí se configura SMTP propio.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirectTo.pathname = isSafeNextPath(next) ? next : "/cuenta";
      return NextResponse.redirect(redirectTo);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirectTo.pathname = isSafeNextPath(next) ? next : "/cuenta";
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/auth/error";
  return NextResponse.redirect(redirectTo);
}
