import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type TicketTypeRow = Database["public"]["Tables"]["ticket_types"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];

export interface TicketInventory {
  capacityTotal: number;
  active: number;
  used: number;
  cancelled: number;
  refunded: number;
  expired: number;
  disputed: number;
  held: number;
  available: number;
}

/** Desglose de inventario de UN tipo de entrada, con los buckets pedidos. */
export async function getTicketTypeInventory(ticketTypeId: string): Promise<TicketInventory | null> {
  const supabase = await createClient();

  const { data: tt } = await supabase
    .from("ticket_types")
    .select("quantity_total, quantity_sold")
    .eq("id", ticketTypeId)
    .maybeSingle();
  if (!tt) return null;

  const { data: statusRows } = await supabase.from("tickets").select("status").eq("ticket_type_id", ticketTypeId);

  const counts = { active: 0, used: 0, cancelled: 0, refunded: 0, expired: 0, disputed: 0 };
  for (const row of statusRows ?? []) {
    counts[row.status as keyof typeof counts] += 1;
  }

  const { data: heldRows } = await supabase
    .from("orders")
    .select("quantity")
    .eq("ticket_type_id", ticketTypeId)
    .eq("status", "pendiente")
    .gt("expires_at", new Date().toISOString());
  const held = (heldRows ?? []).reduce((sum, r) => sum + r.quantity, 0);

  return {
    capacityTotal: tt.quantity_total,
    ...counts,
    held,
    available: Math.max(tt.quantity_total - tt.quantity_sold - held, 0),
  };
}

/** Inventario de TODOS los tipos de entrada de un evento (dashboard del organizador). */
export async function getEventTicketTypesWithInventory(eventId: string) {
  const supabase = await createClient();
  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  const results = await Promise.all(
    (ticketTypes ?? []).map(async (tt) => ({
      ticketType: tt,
      inventory: await getTicketTypeInventory(tt.id),
    }))
  );
  return results;
}

/** Tipo de entrada + evento, para la página de checkout (solo si el evento está publicado). */
export async function getTicketTypeForPurchase(ticketTypeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_types")
    .select("*, events(*)")
    .eq("id", ticketTypeId)
    .maybeSingle();
  if (!data) return null;
  const { events: event, ...ticketType } = data as TicketTypeRow & { events: EventRow };
  if (!event || event.status !== "publicado") return null;
  return { ticketType, event };
}

export async function getOrderForBuyer(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.buyer_id !== user.id) return null;

  const { data: ticketType } = await supabase
    .from("ticket_types")
    .select("*, events(*)")
    .eq("id", order.ticket_type_id)
    .maybeSingle();
  if (!ticketType) return null;
  const { events: event, ...tt } = ticketType as TicketTypeRow & { events: EventRow };

  const { data: tickets } = await supabase.from("tickets").select("*").eq("order_id", orderId);

  return { order, ticketType: tt, event, tickets: tickets ?? [] };
}

/** Un ticket, visible para su dueño o para el organizador/admin del evento (según RLS). */
export async function getTicketForViewer(ticketId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ticket } = await supabase.from("tickets").select("*").eq("id", ticketId).maybeSingle();
  if (!ticket) return null;

  const { data: ticketType } = await supabase
    .from("ticket_types")
    .select("*, events(*)")
    .eq("id", ticket.ticket_type_id)
    .maybeSingle();
  if (!ticketType) return null;
  const { events: event, ...tt } = ticketType as TicketTypeRow & { events: EventRow };

  return { ticket, ticketType: tt, event, isOwner: ticket.owner_id === user.id };
}

/** Entradas individuales de un tipo de entrada, para que el organizador pueda gestionarlas una por una. */
export async function getTicketsForOrganizer(ticketTypeId: string): Promise<TicketRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("ticket_type_id", ticketTypeId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getMyTickets() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tickets")
    .select("*, ticket_types(name, events(title, starts_at, timezone, venue_name, city, cover_image_url, category))")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
