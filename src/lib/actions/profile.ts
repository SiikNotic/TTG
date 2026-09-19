"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/auth";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!fullName) return { error: "Ingresa tu nombre." };
  if (fullName.length > 80) return { error: "El nombre es demasiado largo." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  // auth.uid() = id vía RLS: solo puede actualizar su propia fila, sin
  // importar qué id se intente pasar. El trigger protect_profile_role
  // además impide cambiar el rol desde aquí.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { error: "No se pudo actualizar el perfil." };

  revalidatePath("/cuenta");
  revalidatePath("/", "layout");
  return { success: "Perfil actualizado." };
}

export async function uploadAvatar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "La imagen no puede superar 2 MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró." };

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  // La ruta empieza con el user id: la policy de Storage exige que
  // coincida con auth.uid(), así un usuario no puede escribir (ni
  // sobrescribir) el avatar de otra cuenta cambiando este valor.
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: "No se pudo subir la imagen." };

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (dbError) return { error: "No se pudo guardar la imagen de perfil." };

  revalidatePath("/cuenta");
  revalidatePath("/", "layout");
  return { success: "Foto de perfil actualizada." };
}
