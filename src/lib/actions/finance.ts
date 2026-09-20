"use server";

import { createClient } from "@/lib/supabase/server";
import type { FinanceFilters } from "@/lib/finance";

const TYPE_LABEL: Record<string, string> = { charge: "Cobro", refund: "Reembolso", dispute: "Disputa" };

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/**
 * Exporta TODAS las transacciones que matchean los filtros (no solo la
 * página visible), re-consultando el backend: el CSV nunca sale de sumar
 * lo que ya estaba pintado en pantalla.
 */
export async function exportTransactionsCsv(filters: FinanceFilters): Promise<{ csv?: string; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("payment_transactions")
    .select(
      "created_at, type, gross_amount, platform_fee_amount, organizer_amount, currency, orders!inner(event_id, ticket_type_id, events!inner(title), ticket_types!inner(name))"
    );
  if (filters.eventId) query = query.eq("orders.event_id", filters.eventId);
  if (filters.ticketTypeId) query = query.eq("orders.ticket_type_id", filters.ticketTypeId);
  if (filters.transactionType) query = query.eq("type", filters.transactionType);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(5000);
  if (error) return { error: "No se pudo generar el export." };

  const header = [
    "Fecha",
    "Evento",
    "Tipo de entrada",
    "Tipo de transacción",
    "Monto bruto",
    "Comisión",
    "Monto organizador",
    "Moneda",
  ];

  type Row = {
    created_at: string;
    type: string;
    gross_amount: number;
    platform_fee_amount: number;
    organizer_amount: number;
    currency: string;
    orders: { events: { title: string } | null; ticket_types: { name: string } | null } | null;
  };

  const lines = ((data ?? []) as unknown as Row[]).map((row) =>
    [
      row.created_at,
      row.orders?.events?.title ?? "",
      row.orders?.ticket_types?.name ?? "",
      TYPE_LABEL[row.type] ?? row.type,
      (row.gross_amount / 100).toFixed(2),
      (row.platform_fee_amount / 100).toFixed(2),
      (row.organizer_amount / 100).toFixed(2),
      row.currency.toUpperCase(),
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  return { csv: [header.join(","), ...lines].join("\n") };
}
