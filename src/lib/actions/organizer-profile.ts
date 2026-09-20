"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
// Allowlist explícita, no "startsWith('image/')": eso también deja pasar
// image/svg+xml, y un SVG puede llevar <script> embebido (XSS almacenado
// si alguien abre la imagen directo). El bucket además tiene su propio
// allowed_mime_types como segunda barrera del lado de Storage.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function updateOrganizerProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();

  if (!displayName) return { error: "Ingresa un nombre público para tu organización." };
  if (displayName.length > 80) return { error: "El nombre es demasiado largo." };
  if (bio.length > 500) return { error: "La biografía es demasiado larga (máx. 500 caracteres)." };
  if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl)) {
    return { error: "El sitio web debe empezar con http:// o https://." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const { error } = await supabase.from("organizer_profiles").upsert({
    id: user.id,
    display_name: displayName,
    bio,
    website_url: websiteUrl || null,
  });

  if (error) return { error: "No se pudo actualizar el perfil de organizador." };

  revalidatePath("/organizador/perfil");
  return { success: "Perfil actualizado." };
}

export async function uploadOrganizerLogo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona una imagen." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { error: "El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)." };
  if (file.size > MAX_LOGO_BYTES) return { error: "La imagen no puede superar 2 MB." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${user.id}/logo.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("organizer-logos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: "No se pudo subir la imagen." };

  const { data: publicUrlData } = supabase.storage.from("organizer-logos").getPublicUrl(path);
  const logoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("organizer_profiles")
    .upsert({ id: user.id, logo_url: logoUrl });
  if (dbError) return { error: "No se pudo guardar el logo." };

  revalidatePath("/organizador/perfil");
  return { success: "Logo actualizado." };
}
