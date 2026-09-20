import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { EventCategory } from "@/lib/categories";
import { parseRules, type EventRules } from "@/lib/event-rules";
import { getEventTicketTypesWithInventory } from "@/lib/tickets";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

const LOW_STOCK_THRESHOLD = 10;
const UPCOMING_EVENTS_LIMIT = 60;

export interface PublicEventSummary {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  startsAt: string;
  timezone: string;
  venueName: string;
  city: string;
  coverImageUrl: string | null;
  priceFrom: number | null;
  soldOut: boolean;
  lowStock: boolean;
}

/**
 * Eventos publicados y próximos, para el descubrimiento público. La RLS de
 * `events` ya limita esto a status = 'publicado' (o al dueño/admin, que no
 * aplica aquí porque esta página no requiere sesión), pero igual se filtra
 * explícitamente para que la query exprese la intención.
 */
export async function getPublicUpcomingEvents(): Promise<PublicEventSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_types(price, quantity_total, quantity_sold)")
    .eq("status", "publicado")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(UPCOMING_EVENTS_LIMIT);

  if (error || !data) return [];

  return data.map((row) => {
    const { ticket_types, ...event } = row as EventRow & {
      ticket_types: { price: number; quantity_total: number; quantity_sold: number }[];
    };
    const types = ticket_types ?? [];
    const totalAvailable = types.reduce((sum, t) => sum + Math.max(t.quantity_total - t.quantity_sold, 0), 0);
    const soldOut = types.length > 0 && totalAvailable === 0;
    const priceFrom = types.length > 0 ? Math.min(...types.map((t) => t.price)) : null;

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      category: event.category,
      startsAt: event.starts_at,
      timezone: event.timezone,
      venueName: event.venue_name,
      city: event.city,
      coverImageUrl: event.cover_image_url,
      priceFrom,
      soldOut,
      lowStock: !soldOut && totalAvailable > 0 && totalAvailable <= LOW_STOCK_THRESHOLD,
    };
  });
}

export interface PublicTicketTypeSummary {
  id: string;
  name: string;
  price: number;
  available: number;
  maxPerBuyer: number;
}

export interface PublicEventDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  startsAt: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  minAge: number | null;
  coverImageUrl: string | null;
  rules: EventRules;
  isPast: boolean;
  organizer: {
    name: string;
    bio: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    eventsCount: number;
  };
  ticketTypes: PublicTicketTypeSummary[];
}

/** Un evento publicado por su slug, con inventario real por tipo de entrada. */
export async function getPublicEventBySlug(slug: string): Promise<PublicEventDetail | null> {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  if (!event) return null;

  const [{ data: organizer }, { count: eventsCount }, ticketTypesWithInventory] = await Promise.all([
    supabase
      .from("organizer_profiles")
      .select("display_name, bio, logo_url, website_url")
      .eq("id", event.organizer_id)
      .maybeSingle(),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("organizer_id", event.organizer_id)
      .eq("status", "publicado"),
    getEventTicketTypesWithInventory(event.id),
  ]);

  const ticketTypes: PublicTicketTypeSummary[] = ticketTypesWithInventory.map(({ ticketType, inventory }) => ({
    id: ticketType.id,
    name: ticketType.name,
    price: ticketType.price,
    available: inventory?.available ?? 0,
    maxPerBuyer: ticketType.max_per_buyer,
  }));

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    category: event.category,
    startsAt: event.starts_at,
    timezone: event.timezone,
    venueName: event.venue_name,
    address: event.address,
    city: event.city,
    minAge: event.min_age,
    coverImageUrl: event.cover_image_url,
    rules: parseRules(event.rules),
    isPast: new Date(event.ends_at ?? event.starts_at).getTime() < Date.now(),
    organizer: {
      name: organizer?.display_name || "Organizador",
      bio: organizer?.bio ?? null,
      logoUrl: organizer?.logo_url ?? null,
      websiteUrl: organizer?.website_url ?? null,
      eventsCount: eventsCount ?? 0,
    },
    ticketTypes,
  };
}
