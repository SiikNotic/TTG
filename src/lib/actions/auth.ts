"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/errors";
import { getSiteUrl, isSafeNextPath } from "@/lib/site-url";
import type { ActionState } from "@/lib/actions/action-state";

export type { ActionState } from "@/lib/actions/action-state";

const SIGNUP_ROLES = new Set(["asistente", "organizador"]);

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "asistente");

  if (!email || !password || !fullName) {
    return { error: "Completa todos los campos." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  // El registro público solo puede crear cuentas de asistente u organizador.
  // La cuenta de administrador nunca se autoasigna desde este formulario;
  // esto además se aplica en la base de datos (trigger handle_new_user),
  // así que aunque alguien manipule el request no puede volverse admin.
  if (!SIGNUP_ROLES.has(role)) {
    return { error: "Tipo de cuenta inválido." };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${siteUrl}/auth/confirm?type=signup`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  redirect(`/verificar-email?email=${encodeURIComponent(email)}`);
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Completa correo y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translateAuthError(error.message) };

  revalidatePath("/", "layout");

  // Si venía de un intento de acceder a una ruta protegida (ej. el
  // middleware redirigió a /iniciar-sesion?next=/organizador), respeta ese
  // destino. Si no, el destino depende del rol: cada tipo de cuenta tiene
  // un "home" distinto.
  if (isSafeNextPath(next)) redirect(next);

  const userId = data.user?.id;
  const { data: profile } = userId
    ? await supabase.from("profiles").select("role").eq("id", userId).single()
    : { data: null };

  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "organizador") redirect("/organizador");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Cierra la sesión en todos los dispositivos (revoca todos los refresh tokens). */
export async function signOutEverywhere() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/iniciar-sesion");
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Ingresa tu correo." };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?type=recovery&next=/restablecer-contrasena`,
  });

  // Mismo mensaje exista o no la cuenta: evita enumerar correos registrados.
  return {
    success: "Si el correo está registrado, enviamos un enlace para restablecer la contraseña.",
  };
}

export async function setNewPasswordAfterRecovery(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirmPassword) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "El enlace expiró o ya fue usado. Solicita uno nuevo." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };

  // Igual que en el cambio de contraseña desde la cuenta: una recuperación
  // exitosa revoca cualquier otra sesión que hubiera quedado abierta.
  await supabase.auth.signOut({ scope: "others" });

  revalidatePath("/", "layout");
  redirect("/cuenta");
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Ingresa tu contraseña actual." };
  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas nuevas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Tu sesión expiró." };

  // Se re-verifica la contraseña actual antes de permitir el cambio (evita
  // que alguien con una sesión abierta sin vigilancia cambie la contraseña).
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "La contraseña actual es incorrecta." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: translateAuthError(error.message) };

  // Si alguien más tenía una sesión abierta con la contraseña anterior
  // (o la propia cuenta estaba comprometida), cambiar la contraseña debe
  // cerrarle el paso: se revocan todas las demás sesiones, dejando activa
  // solo la que acaba de hacer el cambio.
  await supabase.auth.signOut({ scope: "others" });

  return { success: "Contraseña actualizada correctamente. Cerramos tus otras sesiones activas." };
}

export async function resendVerificationEmail(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Correo inválido." };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/confirm?type=signup` },
  });

  if (error) return { error: translateAuthError(error.message) };
  return { success: "Enviamos el correo de verificación nuevamente." };
}
