import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type TicketTypeRow = Database["public"]["Tables"]["ticket_types"]["Row"];
export type OrganizerProfileRow = Database["public"]["Tables"]["organizer_profiles"]["Row"];

export interface OrganizerEventWithCounts extends EventRow {
  ticket_type_count: number;
}

/**
 * Eventos del organizador autenticado. Se filtra explícitamente por
 * organizer_id del usuario actual (no solo se confía en RLS) para que
 * esta vista sea siempre "mis eventos", incluso para una cuenta admin.
 */
export async function getOrganizerEvents(): Promise<OrganizerEventWithCounts[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(count)")
    .eq("organizer_id", user.id)
    .order("starts_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const { ticket_types, ...event } = row as EventRow & {
      ticket_types: { count: number }[];
    };
    return { ...event, ticket_type_count: ticket_types?.[0]?.count ?? 0 };
  });
}

/**
 * Un evento puntual, verificando dueño (o admin) explícitamente además
 * de RLS: defensa en profundidad ante un eventual bug en las policies.
 */
export async function getEventForOrganizer(
  eventId: string
): Promise<{ event: EventRow; ticketTypes: TicketTypeRow[] } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!event) return null;

  if (event.organizer_id !== user.id) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
  }

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  return { event, ticketTypes: ticketTypes ?? [] };
}

export async function getOrganizerProfile(userId: string): Promise<OrganizerProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizer_profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}
