import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente con la clave service_role: hace bypass de RLS. SOLO para el
 * webhook de Stripe y para confirmar, ya del lado del servidor, un
 * resultado que Stripe ya verificó (nunca para nada que dependa de lo que
 * diga el frontend). No usar cookies ni sesión de usuario con este cliente.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
