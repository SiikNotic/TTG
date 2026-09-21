import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { EventRow } from "@/lib/organizer";

export type EventStaffRow = Database["public"]["Tables"]["event_staff"]["Row"];

/** Invitaciones (cualquier estado) donde el usuario actual es el invitado. */
export async function getMyStaffInvitations(): Promise<EventStaffRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("event_staff")
    .select("*")
    .eq("staff_user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Staff invitado por el organizador actual (cualquier estado). */
export async function getMyOrganizerStaff(): Promise<EventStaffRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("event_staff")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * Eventos que el usuario actual puede escanear: los suyos (si es
 * organizador) más los que le concedieron como staff aceptado (puntuales o
 * de todo el negocio). Reemplaza a getOrganizerEvents() en el selector del
 * escáner, que solo mostraba "mis eventos".
 */
export async function getScannableEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [ownedResult, staffResult] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("organizer_id", user.id)
      .neq("status", "borrador"),
    supabase
      .from("event_staff")
      .select("event_id, organizer_id")
      .eq("staff_user_id", user.id)
      .eq("status", "aceptada"),
  ]);

  const owned = ownedResult.data ?? [];
  const grants = staffResult.data ?? [];

  const eventScopedIds = grants.map((g) => g.event_id).filter((id): id is string => id !== null);
  const businessWideOrganizerIds = grants.filter((g) => g.event_id === null).map((g) => g.organizer_id);

  const byId = new Map<string, EventRow>();
  for (const e of owned) byId.set(e.id, e);

  if (eventScopedIds.length > 0) {
    const { data } = await supabase.from("events").select("*").in("id", eventScopedIds).neq("status", "borrador");
    for (const e of data ?? []) byId.set(e.id, e);
  }

  if (businessWideOrganizerIds.length > 0) {
    const { data } = await supabase
      .from("events")
      .select("*")
      .in("organizer_id", businessWideOrganizerIds)
      .neq("status", "borrador");
    for (const e of data ?? []) byId.set(e.id, e);
  }

  return Array.from(byId.values()).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

/** Conteos livianos para los botones de acceso rápido del navbar. */
export async function getStaffQuickAccessCounts(userId: string): Promise<{
  pendingInvitations: number;
  acceptedMemberships: number;
}> {
  const supabase = await createClient();
  const [pending, accepted] = await Promise.all([
    supabase
      .from("event_staff")
      .select("id", { count: "exact", head: true })
      .eq("staff_user_id", userId)
      .eq("status", "pendiente"),
    supabase
      .from("event_staff")
      .select("id", { count: "exact", head: true })
      .eq("staff_user_id", userId)
      .eq("status", "aceptada"),
  ]);

  return {
    pendingInvitations: pending.count ?? 0,
    acceptedMemberships: accepted.count ?? 0,
  };
}
