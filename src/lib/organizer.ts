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
    if (profile?.role !== "admin") {
      const { data: grant } = await supabase
        .from("event_staff")
        .select("id")
        .eq("staff_user_id", user.id)
        .eq("organizer_id", event.organizer_id)
        .eq("status", "aceptada")
        .or(`event_id.eq.${eventId},event_id.is.null`)
        .maybeSingle();
      if (!grant) return null;
    }
  }

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  return { event, ticketTypes: ticketTypes ?? [] };
}

export interface ScanHistoryEntry {
  id: string;
  result: string;
  createdAt: string;
  ticketId: string | null;
  serial: string | null;
  scannedByName: string | null;
}

const SCAN_HISTORY_LIMIT = 50;

/**
 * Historial de escaneos de un evento (B5): último primero, usando el
 * índice existente scan_attempts_event_created_idx. Sin chequeo manual de
 * dueño/admin acá a propósito: el acceso lo decide únicamente la policy
 * RLS scan_attempts_select_organizer_or_admin ya existente (organizador
 * dueño del evento, o admin) — esta función solo debe llamarse desde una
 * página que ya haya validado el evento (getEventForOrganizer), igual que
 * el resto de lecturas de esta página.
 *
 * "Quién escaneó" no puede resolverse solo con profiles(full_name): un
 * organizador no tiene (ni debe tener) permiso RLS para leer el perfil de
 * OTRO usuario, así que ese embed vuelve null en el caso más común (staff
 * escaneando, no el propio organizador). event_staff sí es legible por el
 * organizador para su propio staff (policy ya existente), así que se usa
 * staff_display_name_snapshot como respaldo — dos queries fijas en total,
 * ninguna proporcional a la cantidad de escaneos (no es N+1).
 */
export async function getScanHistoryForEvent(
  eventId: string
): Promise<{ entries: ScanHistoryEntry[]; hasMore: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scan_attempts")
    .select("id, result, created_at, ticket_id, scanned_by, tickets(serial), profiles(full_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .range(0, SCAN_HISTORY_LIMIT);

  if (error || !data) return { entries: [], hasMore: false };

  const hasMore = data.length > SCAN_HISTORY_LIMIT;
  const rows = hasMore ? data.slice(0, SCAN_HISTORY_LIMIT) : data;

  const staffNameByUserId = new Map<string, string>();
  const scannerIds = [...new Set(rows.map((row) => row.scanned_by))];
  if (scannerIds.length > 0) {
    const { data: staffRows } = await supabase
      .from("event_staff")
      .select("staff_user_id, staff_display_name_snapshot")
      .in("staff_user_id", scannerIds);
    for (const s of staffRows ?? []) {
      if (!staffNameByUserId.has(s.staff_user_id)) {
        staffNameByUserId.set(s.staff_user_id, s.staff_display_name_snapshot);
      }
    }
  }

  return {
    entries: rows.map((row) => ({
      id: row.id,
      result: row.result,
      createdAt: row.created_at,
      ticketId: row.ticket_id,
      serial: (row.tickets as { serial: string } | null)?.serial ?? null,
      scannedByName:
        (row.profiles as { full_name: string | null } | null)?.full_name ??
        staffNameByUserId.get(row.scanned_by) ??
        null,
    })),
    hasMore,
  };
}

export async function getOrganizerProfile(userId: string): Promise<OrganizerProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizer_profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export type VenueSeriesRow = Database["public"]["Tables"]["venue_series"]["Row"];

/** "Negocios recurrentes" del organizador (bares/discotecas con cover fijo por día). */
export async function getMyVenueSeries(): Promise<VenueSeriesRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("venue_series")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Una serie puntual, verificando dueño (o admin) además de RLS. */
export async function getVenueSeriesForOrganizer(
  seriesId: string
): Promise<{ series: VenueSeriesRow; upcomingEvents: EventRow[] } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: series } = await supabase.from("venue_series").select("*").eq("id", seriesId).maybeSingle();
  if (!series) return null;

  if (series.organizer_id !== user.id) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return null;
  }

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("series_id", seriesId)
    .order("starts_at", { ascending: true });

  return { series, upcomingEvents: upcomingEvents ?? [] };
}
