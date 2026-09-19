import "server-only";
import { headers } from "next/headers";

/**
 * Origin base para construir links de email (confirmación, recuperación).
 * Prioriza NEXT_PUBLIC_SITE_URL (recomendado en producción/Vercel) y cae
 * a los headers de la request en desarrollo.
 */
export async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

/** Evita open redirects: solo permite rutas relativas dentro del propio sitio. */
export function isSafeNextPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}
