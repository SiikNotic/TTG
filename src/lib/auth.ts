import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  avatarUrl: string | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
  asistente: "Asistente",
  organizador: "Organizador",
  admin: "Administrador",
};

export function roleLabel(role: UserRole) {
  return ROLE_LABELS[role];
}

/**
 * Usuario autenticado + su perfil, para Server Components y Server
 * Actions. Usa getClaims() (valida la firma del JWT localmente) en vez
 * de getSession(), que no revalida el token y no debe usarse para
 * decisiones de autorización.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", claims.sub)
    .single();

  if (!profile) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    role: profile.role as UserRole,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
  };
}
