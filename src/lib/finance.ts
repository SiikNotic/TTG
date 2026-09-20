import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface FinanceFilters {
  eventId?: string;
  ticketTypeId?: string;
  transactionType?: "charge" | "refund" | "dispute";
  dateFrom?: string;
  dateTo?: string;
}

export interface InventorySummary {
  sold: number;
  used: number;
  available: number;
  capacityTotal: number;
}

export interface FinanceTotals {
  grossSales: number;
  refunds: number;
  platformFees: number;
  organizerBalance: number;
  transactionCount: number;
}

export interface TransactionRow {
  id: string;
  createdAt: string;
  type: string;
  grossAmount: number;
  platformFeeAmount: number;
  organizerAmount: number;
  currency: string;
  eventTitle: string;
  ticketTypeName: string;
}

type EmbeddedTransactionRow = {
  id: string;
  created_at: string;
  type: string;
  gross_amount: number;
  platform_fee_amount: number;
  organizer_amount: number;
  currency: string;
  orders: { events: { title: string } | null; ticket_types: { name: string } | null } | null;
};

/**
 * Inventario ACTUAL (no filtrado por fecha: no tiene sentido preguntar
 * "disponibles a una fecha pasada"). quantity_sold ya es neto de
 * reembolsos/cancelaciones (se decrementa ahí mismo), así que "vendidos"
 * acá es consistente con lo que ya muestra el panel de inventario por
 * evento.
 */
export async function getOrganizerInventorySummary(eventId?: string): Promise<InventorySummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { sold: 0, used: 0, available: 0, capacityTotal: 0 };

  // RLS en ticket_types también permite ver los de CUALQUIER evento
  // publicado (para el descubrimiento público): filtrar explícitamente por
  // organizer_id acá, no confiar solo en RLS, o este resumen mezclaría
  // inventario de otros organizadores.
  let query = supabase
    .from("ticket_types")
    .select("id, quantity_total, quantity_sold, events!inner(organizer_id)")
    .eq("events.organizer_id", user.id);
  if (eventId) query = query.eq("event_id", eventId);

  const { data: ticketTypes } = await query;
  const ttIds = (ticketTypes ?? []).map((t) => t.id);
  if (ttIds.length === 0) return { sold: 0, used: 0, available: 0, capacityTotal: 0 };

  const { data: heldRows } = await supabase
    .from("orders")
    .select("quantity")
    .in("ticket_type_id", ttIds)
    .eq("status", "pendiente")
    .gt("expires_at", new Date().toISOString());
  const held = (heldRows ?? []).reduce((sum, r) => sum + r.quantity, 0);

  const { count: usedCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .in("ticket_type_id", ttIds)
    .eq("status", "used");

  const capacityTotal = ticketTypes!.reduce((sum, t) => sum + t.quantity_total, 0);
  const sold = ticketTypes!.reduce((sum, t) => sum + t.quantity_sold, 0);

  return {
    sold,
    used: usedCount ?? 0,
    available: Math.max(capacityTotal - sold - held, 0),
    capacityTotal,
  };
}

/**
 * Totales financieros del rango filtrado. RLS ya restringe
 * payment_transactions a las órdenes de eventos del organizador (o admin):
 * no hace falta un filtro extra de organizer_id acá. Se suma en el
 * servidor (Server Component / Server Action), nunca en el navegador.
 */
export async function getFinanceTotals(filters: FinanceFilters): Promise<FinanceTotals> {
  const supabase = await createClient();
  let query = supabase
    .from("payment_transactions")
    .select("type, gross_amount, platform_fee_amount, organizer_amount, orders!inner(event_id, ticket_type_id)");
  if (filters.eventId) query = query.eq("orders.event_id", filters.eventId);
  if (filters.ticketTypeId) query = query.eq("orders.ticket_type_id", filters.ticketTypeId);
  if (filters.transactionType) query = query.eq("type", filters.transactionType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);

  const { data } = await query;

  let grossSales = 0;
  let refunds = 0;
  let platformFees = 0;
  let organizerBalance = 0;
  for (const row of data ?? []) {
    platformFees += row.platform_fee_amount;
    organizerBalance += row.organizer_amount;
    if (row.type === "charge") grossSales += row.gross_amount;
    if (row.type === "refund") refunds += Math.abs(row.gross_amount);
  }

  return { grossSales, refunds, platformFees, organizerBalance, transactionCount: data?.length ?? 0 };
}

const PAGE_SIZE = 25;

export async function getTransactionHistory(
  filters: FinanceFilters,
  page: number
): Promise<{ rows: TransactionRow[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("payment_transactions")
    .select(
      "id, created_at, type, gross_amount, platform_fee_amount, organizer_amount, currency, orders!inner(event_id, ticket_type_id, events!inner(title), ticket_types!inner(name))",
      { count: "exact" }
    );
  if (filters.eventId) query = query.eq("orders.event_id", filters.eventId);
  if (filters.ticketTypeId) query = query.eq("orders.ticket_type_id", filters.ticketTypeId);
  if (filters.transactionType) query = query.eq("type", filters.transactionType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  const rows: TransactionRow[] = ((data ?? []) as unknown as EmbeddedTransactionRow[]).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    type: row.type,
    grossAmount: row.gross_amount,
    platformFeeAmount: row.platform_fee_amount,
    organizerAmount: row.organizer_amount,
    currency: row.currency,
    eventTitle: row.orders?.events?.title ?? "—",
    ticketTypeName: row.orders?.ticket_types?.name ?? "—",
  }));

  return { rows, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}

export interface OrganizerEventOption {
  id: string;
  title: string;
}

export interface OrganizerTicketTypeOption {
  id: string;
  name: string;
  eventId: string;
}

/** Opciones para los selects de filtro (eventos y tipos de ticket del organizador). */
export async function getFinanceFilterOptions(): Promise<{
  events: OrganizerEventOption[];
  ticketTypes: OrganizerTicketTypeOption[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { events: [], ticketTypes: [] };

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .eq("organizer_id", user.id)
    .order("starts_at", { ascending: false });

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("id, name, event_id, events!inner(organizer_id)")
    .eq("events.organizer_id", user.id);

  return {
    events: events ?? [],
    ticketTypes: (ticketTypes ?? []).map((t) => ({ id: t.id, name: t.name, eventId: t.event_id })),
  };
}
