import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Crear uno nuevo por request (nunca reutilizar una instancia
 * a nivel de módulo): con Fluid Compute un mismo proceso puede atender
 * requests de distintos usuarios.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se llamó desde un Server Component (no puede escribir cookies).
            // Es seguro ignorarlo porque el middleware refresca la sesión.
          }
        },
      },
    }
  );
}
