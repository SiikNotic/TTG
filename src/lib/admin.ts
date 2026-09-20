import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type EventStatus = Database["public"]["Enums"]["event_status"];

/**
 * Todas las funciones de este módulo asumen que quien llama ya pasó el
 * gate de rol admin del middleware (prefijo /admin). Igual se apoyan en
 * RLS (policies *_admin) para la lectura real: si algún día se llaman
 * desde otro lado sin ese gate, no exponen nada que RLS no permita.
 */

export interface PlatformOverview {
  usersByRole: Record<UserRole, number>;
  eventsByStatus: Record<EventStatus, number>;
  ticketsByStatus: Record<string, number>;
  organizersWithStripeEnabled: number;
  grossSales: number;
  refunds: number;
  platformFees: number;
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: events }, { data: tickets }, { count: stripeEnabledCount }, { data: txns }] =
    await Promise.all([
      supabase.from("profiles").select("role"),
      supabase.from("events").select("status"),
      supabase.from("tickets").select("status"),
      supabase
        .from("organizer_stripe_accounts")
        .select("organizer_id", { count: "exact", head: true })
        .eq("charges_enabled", true),
      supabase.from("payment_transactions").select("type, gross_amount, platform_fee_amount"),
    ]);

  const usersByRole: Record<UserRole, number> = { asistente: 0, organizador: 0, admin: 0 };
  for (const p of profiles ?? []) usersByRole[p.role as UserRole]++;

  const eventsByStatus: Record<EventStatus, number> = { borrador: 0, publicado: 0, pausado: 0, cancelado: 0 };
  for (const e of events ?? []) eventsByStatus[e.status as EventStatus]++;

  const ticketsByStatus: Record<string, number> = {};
  for (const t of tickets ?? []) ticketsByStatus[t.status] = (ticketsByStatus[t.status] ?? 0) + 1;

  let grossSales = 0;
  let refunds = 0;
  let platformFees = 0;
  for (const row of txns ?? []) {
    platformFees += row.platform_fee_amount;
    if (row.type === "charge") grossSales += row.gross_amount;
    if (row.type === "refund") refunds += Math.abs(row.gross_amount);
  }

  return {
    usersByRole,
    eventsByStatus,
    ticketsByStatus,
    organizersWithStripeEnabled: stripeEnabledCount ?? 0,
    grossSales,
    refunds,
    platformFees,
  };
}

export interface AdminUserRow {
  id: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
  avatarUrl: string | null;
}

const PAGE_SIZE = 25;

export async function getUsers(
  filters: { search?: string; role?: UserRole },
  page: number
): Promise<{ rows: AdminUserRow[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("profiles")
    .select("id, full_name, role, created_at, avatar_url", { count: "exact" });
  if (filters.role) query = query.eq("role", filters.role);
  if (filters.search) query = query.ilike("full_name", `%${filters.search}%`);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  return {
    rows: (data ?? []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      role: p.role as UserRole,
      createdAt: p.created_at,
      avatarUrl: p.avatar_url,
    })),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export interface AdminOrganizerRow {
  id: string;
  displayName: string | null;
  fullName: string | null;
  eventCount: number;
  chargesEnabled: boolean;
  stripeAccountId: string | null;
  soldCount: number;
  refundCount: number;
  refundRate: number;
}

/** Organizadores + una señal de riesgo simple (tasa de reembolso). */
export async function getOrganizers(): Promise<AdminOrganizerRow[]> {
  const supabase = await createClient();

  const [{ data: organizerProfiles }, { data: events }, { data: stripeAccounts }, { data: txns }] = await Promise.all([
    supabase.from("organizer_profiles").select("id, display_name, profiles!organizer_profiles_id_fkey(full_name)"),
    supabase.from("events").select("id, organizer_id"),
    supabase.from("organizer_stripe_accounts").select("organizer_id, charges_enabled, stripe_account_id"),
    supabase.from("payment_transactions").select("type, orders!inner(event_id)"),
  ]);

  const eventOwnerByEventId = new Map((events ?? []).map((e) => [e.id, e.organizer_id]));
  const eventCountByOrganizer = new Map<string, number>();
  for (const e of events ?? []) {
    eventCountByOrganizer.set(e.organizer_id, (eventCountByOrganizer.get(e.organizer_id) ?? 0) + 1);
  }
  const stripeByOrganizer = new Map(
    (stripeAccounts ?? []).map((s) => [s.organizer_id, { chargesEnabled: s.charges_enabled, id: s.stripe_account_id }])
  );

  const soldByOrganizer = new Map<string, number>();
  const refundByOrganizer = new Map<string, number>();
  for (const t of (txns ?? []) as unknown as { type: string; orders: { event_id: string } | null }[]) {
    const eventId = t.orders?.event_id;
    if (!eventId) continue;
    const organizerId = eventOwnerByEventId.get(eventId);
    if (!organizerId) continue;
    if (t.type === "charge") soldByOrganizer.set(organizerId, (soldByOrganizer.get(organizerId) ?? 0) + 1);
    if (t.type === "refund") refundByOrganizer.set(organizerId, (refundByOrganizer.get(organizerId) ?? 0) + 1);
  }

  return (organizerProfiles ?? []).map((o) => {
    const profile = o.profiles as unknown as { full_name: string | null } | null;
    const sold = soldByOrganizer.get(o.id) ?? 0;
    const refunded = refundByOrganizer.get(o.id) ?? 0;
    const stripe = stripeByOrganizer.get(o.id);
    return {
      id: o.id,
      displayName: o.display_name,
      fullName: profile?.full_name ?? null,
      eventCount: eventCountByOrganizer.get(o.id) ?? 0,
      chargesEnabled: stripe?.chargesEnabled ?? false,
      stripeAccountId: stripe?.id ?? null,
      soldCount: sold,
      refundCount: refunded,
      refundRate: sold > 0 ? refunded / sold : 0,
    };
  });
}

export interface AdminEventRow {
  id: string;
  title: string;
  status: EventStatus;
  organizerId: string;
  organizerName: string | null;
  startsAt: string;
  timezone: string;
  createdAt: string;
}

export async function getEvents(
  filters: { search?: string; status?: EventStatus; organizerId?: string },
  page: number
): Promise<{ rows: AdminEventRow[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("events")
    .select("id, title, status, organizer_id, starts_at, timezone, created_at", { count: "exact" });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.organizerId) query = query.eq("organizer_id", filters.organizerId);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);
  const rows = data ?? [];

  // events -> organizer_profiles no tiene FK directa (ambas apuntan a
  // profiles por separado), así que PostgREST no puede embeberla: se
  // resuelve con una segunda consulta y se mapea acá.
  const organizerIds = [...new Set(rows.map((e) => e.organizer_id))];
  const { data: organizerProfiles } =
    organizerIds.length > 0
      ? await supabase.from("organizer_profiles").select("id, display_name").in("id", organizerIds)
      : { data: [] };
  const nameByOrganizer = new Map((organizerProfiles ?? []).map((o) => [o.id, o.display_name]));

  return {
    rows: rows.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      organizerId: e.organizer_id,
      organizerName: nameByOrganizer.get(e.organizer_id) ?? null,
      startsAt: e.starts_at,
      timezone: e.timezone,
      createdAt: e.created_at,
    })),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export interface TicketLookupResult {
  id: string;
  serial: string;
  status: string;
  eventTitle: string;
  ownerName: string | null;
  ownerId: string;
  createdAt: string;
  usedAt: string | null;
}

/** Búsqueda de soporte: por serial (exacto o parcial) o por id de ticket. */
export async function lookupTickets(query: string): Promise<TicketLookupResult[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();

  const isUuid = /^[0-9a-f-]{36}$/i.test(query.trim());
  let q = supabase
    .from("tickets")
    .select(
      "id, serial, status, created_at, used_at, owner_id, events!inner(title), profiles!tickets_owner_id_fkey(full_name)"
    )
    .limit(20);
  q = isUuid ? q.eq("id", query.trim()) : q.ilike("serial", `%${query.trim()}%`);

  const { data } = await q;
  return ((data ?? []) as unknown as {
    id: string;
    serial: string;
    status: string;
    created_at: string;
    used_at: string | null;
    owner_id: string;
    events: { title: string } | null;
    profiles: { full_name: string | null } | null;
  }[]).map((t) => ({
    id: t.id,
    serial: t.serial,
    status: t.status,
    eventTitle: t.events?.title ?? "—",
    ownerName: t.profiles?.full_name ?? null,
    ownerId: t.owner_id,
    createdAt: t.created_at,
    usedAt: t.used_at,
  }));
}

export interface AdminTransactionRow {
  id: string;
  createdAt: string;
  type: string;
  grossAmount: number;
  platformFeeAmount: number;
  organizerAmount: number;
  eventTitle: string;
  organizerName: string | null;
}

export interface AdminTransactionFilters {
  transactionType?: "charge" | "refund" | "dispute";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getTransactions(
  filters: AdminTransactionFilters,
  page: number
): Promise<{ rows: AdminTransactionRow[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("payment_transactions")
    .select(
      "id, created_at, type, gross_amount, platform_fee_amount, organizer_amount, orders!inner(events!inner(title, organizer_id))",
      { count: "exact" }
    );
  if (filters.transactionType) query = query.eq("type", filters.transactionType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  if (filters.search) query = query.ilike("orders.events.title", `%${filters.search}%`);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  type Row = {
    id: string;
    created_at: string;
    type: string;
    gross_amount: number;
    platform_fee_amount: number;
    organizer_amount: number;
    orders: { events: { title: string; organizer_id: string } | null } | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  // Igual que en getEvents: sin FK directa events -> organizer_profiles,
  // se resuelve el nombre del organizador en una segunda consulta.
  const organizerIds = [...new Set(rows.map((r) => r.orders?.events?.organizer_id).filter((id): id is string => !!id))];
  const { data: organizerProfiles } =
    organizerIds.length > 0
      ? await supabase.from("organizer_profiles").select("id, display_name").in("id", organizerIds)
      : { data: [] };
  const nameByOrganizer = new Map((organizerProfiles ?? []).map((o) => [o.id, o.display_name]));

  return {
    rows: rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      type: r.type,
      grossAmount: r.gross_amount,
      platformFeeAmount: r.platform_fee_amount,
      organizerAmount: r.organizer_amount,
      eventTitle: r.orders?.events?.title ?? "—",
      organizerName: r.orders?.events?.organizer_id ? (nameByOrganizer.get(r.orders.events.organizer_id) ?? null) : null,
    })),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export interface AdminAuditLogRow {
  id: string;
  adminId: string;
  adminName: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export async function getAuditLog(page: number): Promise<{ rows: AdminAuditLogRow[]; totalCount: number; pageSize: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("admin_audit_log")
    .select("id, admin_id, action, target_type, target_id, details, created_at, profiles!admin_audit_log_admin_id_fkey(full_name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  type Row = {
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id: string | null;
    details: Record<string, unknown>;
    created_at: string;
    profiles: { full_name: string | null } | null;
  };

  return {
    rows: ((data ?? []) as unknown as Row[]).map((r) => ({
      id: r.id,
      adminId: r.admin_id,
      adminName: r.profiles?.full_name ?? null,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      details: r.details,
      createdAt: r.created_at,
    })),
    totalCount: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export interface RiskSignal {
  severity: "warning" | "danger";
  title: string;
  description: string;
  targetType: "organizer" | "event" | "ticket";
  targetId: string;
  targetHref: string;
}

const MIN_SAMPLE_FOR_REFUND_RATE = 5;
const HIGH_REFUND_RATE = 0.25;
const REPEATED_SCAN_WINDOW_HOURS = 24;
const REPEATED_SCAN_THRESHOLD = 8;
const REPEATED_REUSE_THRESHOLD = 2;

/**
 * Señales de riesgo computadas sobre datos reales (nada simulado): tasa
 * de reembolso por organizador, eventos con disputas, y patrones de
 * escaneo anómalos (muchos intentos fallidos seguidos, o intentos
 * repetidos de reusar un ticket ya utilizado — posible reventa/duplicado
 * del QR).
 */
export async function getRiskSignals(): Promise<RiskSignal[]> {
  const supabase = await createClient();
  const signals: RiskSignal[] = [];

  const organizers = await getOrganizers();
  for (const o of organizers) {
    if (o.soldCount >= MIN_SAMPLE_FOR_REFUND_RATE && o.refundRate >= HIGH_REFUND_RATE) {
      signals.push({
        severity: "danger",
        title: "Tasa de reembolso alta",
        description: `${o.displayName ?? o.fullName ?? "Organizador"}: ${o.refundCount}/${o.soldCount} ventas reembolsadas (${Math.round(o.refundRate * 100)}%).`,
        targetType: "organizer",
        targetId: o.id,
        targetHref: `/admin/organizadores`,
      });
    }
  }

  const { data: disputes } = await supabase
    .from("payment_transactions")
    .select("orders!inner(event_id, events!inner(title))")
    .eq("type", "dispute");
  const disputedEvents = new Map<string, { title: string; count: number }>();
  for (const d of (disputes ?? []) as unknown as { orders: { event_id: string; events: { title: string } | null } | null }[]) {
    const eventId = d.orders?.event_id;
    if (!eventId) continue;
    const title = d.orders?.events?.title ?? "Evento";
    const entry = disputedEvents.get(eventId) ?? { title, count: 0 };
    entry.count++;
    disputedEvents.set(eventId, entry);
  }
  for (const [eventId, { title, count }] of disputedEvents) {
    signals.push({
      severity: "danger",
      title: "Evento con disputas (chargebacks)",
      description: `"${title}" tiene ${count} disputa(s) abierta(s) o resuelta(s) contra el emisor de la tarjeta.`,
      targetType: "event",
      targetId: eventId,
      targetHref: `/admin/eventos?search=${encodeURIComponent(title)}`,
    });
  }

  const since = new Date(Date.now() - REPEATED_SCAN_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { data: attempts } = await supabase
    .from("scan_attempts")
    .select("event_id, ticket_id, scanned_by, result, events!inner(title)")
    .gte("created_at", since);

  const failedByScannerEvent = new Map<string, { title: string; count: number; eventId: string }>();
  const reuseByTicket = new Map<string, { count: number; eventId: string; title: string }>();
  for (const a of (attempts ?? []) as unknown as {
    event_id: string;
    ticket_id: string | null;
    scanned_by: string;
    result: string;
    events: { title: string } | null;
  }[]) {
    if (a.result !== "VALIDO") {
      const key = `${a.scanned_by}:${a.event_id}`;
      const entry = failedByScannerEvent.get(key) ?? { title: a.events?.title ?? "Evento", count: 0, eventId: a.event_id };
      entry.count++;
      failedByScannerEvent.set(key, entry);
    }
    if (a.result === "YA_UTILIZADO" && a.ticket_id) {
      const entry = reuseByTicket.get(a.ticket_id) ?? { count: 0, eventId: a.event_id, title: a.events?.title ?? "Evento" };
      entry.count++;
      reuseByTicket.set(a.ticket_id, entry);
    }
  }

  for (const { title, count, eventId } of failedByScannerEvent.values()) {
    if (count >= REPEATED_SCAN_THRESHOLD) {
      signals.push({
        severity: "warning",
        title: "Muchos escaneos fallidos seguidos",
        description: `${count} escaneos no válidos en "${title}" en las últimas ${REPEATED_SCAN_WINDOW_HOURS}h — posible intento de probar códigos al azar.`,
        targetType: "event",
        targetId: eventId,
        targetHref: `/admin/eventos?search=${encodeURIComponent(title)}`,
      });
    }
  }

  for (const [ticketId, { count, title }] of reuseByTicket) {
    if (count >= REPEATED_REUSE_THRESHOLD) {
      signals.push({
        severity: "warning",
        title: "Intentos repetidos de reingreso",
        description: `Un ticket de "${title}" fue escaneado ${count} veces después de ya estar USADO — posible QR duplicado o compartido.`,
        targetType: "ticket",
        targetId: ticketId,
        targetHref: `/admin/tickets?q=${ticketId}`,
      });
    }
  }

  return signals;
}

export interface RevenueByEvent {
  eventId: string;
  title: string;
  grossSales: number;
  refunds: number;
  ticketsSold: number;
}

export interface RevenueByCategory {
  category: string;
  grossSales: number;
}

export interface Reports {
  topEventsByRevenue: RevenueByEvent[];
  revenueByCategory: RevenueByCategory[];
}

/** Reportes reales, agregados desde el ledger de transacciones — sin gráficos, solo tablas. */
export async function getReports(): Promise<Reports> {
  const supabase = await createClient();

  const [{ data: txns }, { data: events }] = await Promise.all([
    supabase
      .from("payment_transactions")
      .select("type, gross_amount, orders!inner(event_id)"),
    supabase.from("events").select("id, title, category"),
  ]);

  const eventById = new Map((events ?? []).map((e) => [e.id, e]));
  const byEvent = new Map<string, { grossSales: number; refunds: number; ticketsSold: number }>();
  const byCategory = new Map<string, number>();

  for (const t of (txns ?? []) as unknown as { type: string; gross_amount: number; orders: { event_id: string } | null }[]) {
    const eventId = t.orders?.event_id;
    if (!eventId) continue;
    const entry = byEvent.get(eventId) ?? { grossSales: 0, refunds: 0, ticketsSold: 0 };
    if (t.type === "charge") {
      entry.grossSales += t.gross_amount;
      entry.ticketsSold += 1;
      const category = eventById.get(eventId)?.category ?? "otros";
      byCategory.set(category, (byCategory.get(category) ?? 0) + t.gross_amount);
    }
    if (t.type === "refund") entry.refunds += Math.abs(t.gross_amount);
    byEvent.set(eventId, entry);
  }

  const topEventsByRevenue = [...byEvent.entries()]
    .map(([eventId, v]) => ({ eventId, title: eventById.get(eventId)?.title ?? "Evento", ...v }))
    .sort((a, b) => b.grossSales - a.grossSales)
    .slice(0, 10);

  const revenueByCategory = [...byCategory.entries()]
    .map(([category, grossSales]) => ({ category, grossSales }))
    .sort((a, b) => b.grossSales - a.grossSales);

  return { topEventsByRevenue, revenueByCategory };
}

export interface OrganizerPayoutBalance {
  organizerId: string;
  displayName: string | null;
  method: "paypal" | "ath_movil" | null;
  paypalEmail: string | null;
  athMovilPhone: string | null;
  pendingBalance: number;
}

/**
 * Solo organizadores con método de cobro 'paypal' o 'ath_movil': los de
 * 'stripe' (o sin configurar) ya se pagan solos vía Stripe Connect y no
 * pasan por esta pantalla. El balance se recalcula siempre desde el
 * ledger real (payment_transactions - organizer_payouts), igual que en
 * getMyPayoutBalance para el propio organizador.
 */
export async function getOrganizerPayoutBalances(): Promise<OrganizerPayoutBalance[]> {
  const supabase = await createClient();

  const [{ data: settings }, { data: organizerProfiles }, { data: txns }, { data: payouts }] = await Promise.all([
    supabase
      .from("organizer_payout_settings")
      .select("organizer_id, method, paypal_email, ath_movil_phone")
      .in("method", ["paypal", "ath_movil"]),
    supabase.from("organizer_profiles").select("id, display_name"),
    supabase
      .from("payment_transactions")
      .select("organizer_amount, orders!inner(payout_rail, events!inner(organizer_id))")
      .neq("orders.payout_rail", "stripe"),
    supabase.from("organizer_payouts").select("organizer_id, amount, status"),
  ]);

  const nameByOrganizer = new Map((organizerProfiles ?? []).map((o) => [o.id, o.display_name]));

  const earnedByOrganizer = new Map<string, number>();
  for (const t of (txns ?? []) as unknown as {
    organizer_amount: number;
    orders: { events: { organizer_id: string } | null } | null;
  }[]) {
    const organizerId = t.orders?.events?.organizer_id;
    if (!organizerId) continue;
    earnedByOrganizer.set(organizerId, (earnedByOrganizer.get(organizerId) ?? 0) + t.organizer_amount);
  }

  const paidByOrganizer = new Map<string, number>();
  for (const p of payouts ?? []) {
    if (p.status === "failed") continue;
    paidByOrganizer.set(p.organizer_id, (paidByOrganizer.get(p.organizer_id) ?? 0) + p.amount);
  }

  return (settings ?? []).map((s) => ({
    organizerId: s.organizer_id,
    displayName: nameByOrganizer.get(s.organizer_id) ?? null,
    method: s.method as "paypal" | "ath_movil",
    paypalEmail: s.paypal_email,
    athMovilPhone: s.ath_movil_phone,
    pendingBalance: Math.max((earnedByOrganizer.get(s.organizer_id) ?? 0) - (paidByOrganizer.get(s.organizer_id) ?? 0), 0),
  }));
}

export interface AdminPayoutRow {
  id: string;
  organizerId: string;
  organizerName: string | null;
  method: "paypal" | "ath_movil";
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  paypalBatchId: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** Últimos payouts de paypal/ath_movil (todos los organizadores), para reconciliar y verificar estado. */
export async function getRecentOrganizerPayouts(): Promise<AdminPayoutRow[]> {
  const supabase = await createClient();

  const [{ data: payouts }, { data: organizerProfiles }] = await Promise.all([
    supabase
      .from("organizer_payouts")
      .select("id, organizer_id, method, amount, currency, status, reference, paypal_batch_id, created_at, completed_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("organizer_profiles").select("id, display_name"),
  ]);

  const nameByOrganizer = new Map((organizerProfiles ?? []).map((o) => [o.id, o.display_name]));

  return (payouts ?? []).map((p) => ({
    id: p.id,
    organizerId: p.organizer_id,
    organizerName: nameByOrganizer.get(p.organizer_id) ?? null,
    method: p.method as "paypal" | "ath_movil",
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    reference: p.reference,
    paypalBatchId: p.paypal_batch_id,
    createdAt: p.created_at,
    completedAt: p.completed_at,
  }));
}

export interface SupportSearchResult {
  tickets: TicketLookupResult[];
  users: AdminUserRow[];
  events: AdminEventRow[];
}

/** Búsqueda unificada de soporte: un cuadro de texto, tres fuentes. */
export async function supportSearch(query: string): Promise<SupportSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { tickets: [], users: [], events: [] };

  const [tickets, { rows: users }, { rows: events }] = await Promise.all([
    lookupTickets(trimmed),
    getUsers({ search: trimmed }, 0),
    getEvents({ search: trimmed }, 0),
  ]);

  return { tickets, users, events };
}
