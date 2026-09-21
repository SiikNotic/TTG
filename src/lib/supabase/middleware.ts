import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

/** Rutas que requieren sesión, sin importar el rol. */
const PROTECTED_PREFIXES = ["/cuenta", "/comprar", "/ordenes", "/tickets", "/mis-tickets", "/invitaciones"];

/** Rutas que requieren sesión + un rol específico. */
const ROLE_PREFIXES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/organizador", roles: ["organizador", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

/**
 * Dentro de /organizador (gateado a organizador/admin), el escáner acepta
 * además a cualquier usuario autenticado con una invitación de staff
 * aceptada: la autorización fina (qué evento puede escanear) la hace la
 * página/RPC, no el middleware. Sin esto, un staff con role='asistente'
 * nunca podría entrar a /organizador/validar.
 */
const STAFF_OVERRIDE_PREFIXES = ["/organizador/validar"];

/** Rutas de auth que no tienen sentido si ya hay sesión activa. */
const AUTH_ONLY_PREFIXES = ["/iniciar-sesion", "/registro"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Con Fluid Compute, el cliente se crea por request: nunca en una
  // variable de módulo compartida entre requests de distintos usuarios.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // No ejecutar código entre createServerClient y getClaims(): getClaims()
  // valida la firma del JWT contra las claves públicas del proyecto en cada
  // llamada, a diferencia de getSession(), que NO debe usarse para proteger
  // rutas porque no revalida el token.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const { pathname } = request.nextUrl;
  const isProtected = matchesPrefix(pathname, PROTECTED_PREFIXES);
  const roleGate = ROLE_PREFIXES.find((r) => matchesPrefix(pathname, [r.prefix]));
  const isStaffOverride = matchesPrefix(pathname, STAFF_OVERRIDE_PREFIXES);
  const isAuthOnly = matchesPrefix(pathname, AUTH_ONLY_PREFIXES);

  if ((isProtected || roleGate) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  if (roleGate && user && !isStaffOverride) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)
      .single();

    if (!profile || !roleGate.roles.includes(profile.role as UserRole)) {
      const url = request.nextUrl.clone();
      url.pathname = "/no-autorizado";
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }

    // El panel de administración exige MFA, sin excepción: una cuenta
    // admin sin factor inscrito no entra (se manda a activarlo en
    // /cuenta), y una que sí lo tiene debe haber completado el desafío
    // (aal2) en esta sesión, no solo tenerlo inscrito alguna vez.
    if (roleGate.prefix === "/admin") {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const hasVerifiedFactor = (factorsData?.totp ?? []).some((f) => f.status === "verified");

      if (!hasVerifiedFactor) {
        const url = request.nextUrl.clone();
        url.pathname = "/cuenta";
        url.search = "";
        url.searchParams.set("mfaRequerido", "1");
        const redirect = NextResponse.redirect(url);
        redirect.headers.set("Cache-Control", "private, no-store");
        return redirect;
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
        const url = request.nextUrl.clone();
        url.pathname = "/verificar-mfa";
        url.searchParams.set("next", pathname);
        const redirect = NextResponse.redirect(url);
        redirect.headers.set("Cache-Control", "private, no-store");
        return redirect;
      }
    }
  }

  if (isAuthOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  if (isProtected || roleGate || isAuthOnly) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store");
  }

  // IMPORTANTE: devolver supabaseResponse tal cual (con sus cookies). Si se
  // necesita un response nuevo, hay que copiar el request y las cookies de
  // supabaseResponse, o el navegador y el servidor pueden desincronizar la
  // sesión y cerrarla prematuramente.
  return supabaseResponse;
}
