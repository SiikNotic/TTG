import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state-message";
import {
  getOrganizerInventorySummary,
  getFinanceTotals,
  getTransactionHistory,
  getFinanceFilterOptions,
  type FinanceFilters as FinanceFiltersType,
} from "@/lib/finance";
import { getMyStripeAccount, getOrganizerPayouts } from "@/lib/payments";
import { formatPrice, formatDateShort, formatTime } from "@/lib/format";
import { FinanceFiltersForm } from "./finance-filters";
import { ExportCsvButton } from "./export-csv-button";

export const dynamic = "force-dynamic";

interface FinancePageProps {
  searchParams: Promise<{
    eventId?: string;
    ticketTypeId?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

function centsToPrice(cents: number) {
  return formatPrice(cents / 100);
}

const TX_TYPE_LABEL: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  charge: { label: "Cobro", variant: "success" },
  refund: { label: "Reembolso", variant: "danger" },
  dispute: { label: "Disputa", variant: "warning" },
};

const PAYOUT_STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  paid: { label: "Pagado", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  in_transit: { label: "En camino", variant: "warning" },
  failed: { label: "Fallido", variant: "danger" },
  canceled: { label: "Cancelado", variant: "neutral" },
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const sp = await searchParams;
  const filters: FinanceFiltersType = {
    eventId: sp.eventId,
    ticketTypeId: sp.ticketTypeId,
    transactionType: sp.type as FinanceFiltersType["transactionType"],
    dateFrom: sp.from,
    dateTo: sp.to,
  };
  const page = Math.max(0, Number(sp.page ?? "0") || 0);

  const [inventory, totals, history, filterOptions, stripeAccount] = await Promise.all([
    getOrganizerInventorySummary(filters.eventId),
    getFinanceTotals(filters),
    getTransactionHistory(filters, page),
    getFinanceFilterOptions(),
    getMyStripeAccount(),
  ]);

  const payouts = stripeAccount?.charges_enabled
    ? await getOrganizerPayouts(stripeAccount.stripe_account_id)
    : [];

  const totalPages = Math.max(1, Math.ceil(history.totalCount / history.pageSize));
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (filters.eventId) params.set("eventId", filters.eventId);
    if (filters.ticketTypeId) params.set("ticketTypeId", filters.ticketTypeId);
    if (filters.transactionType) params.set("type", filters.transactionType);
    if (filters.dateFrom) params.set("from", filters.dateFrom);
    if (filters.dateTo) params.set("to", filters.dateTo);
    if (targetPage > 0) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/organizador/finanzas?${qs}` : "/organizador/finanzas";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Finanzas</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/organizador"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Ventas y dinero</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Todos los números salen directo de la base de datos y de Stripe: nada se calcula solo en el navegador.
        </p>

        <div className="mb-6">
          <FinanceFiltersForm events={filterOptions.events} ticketTypes={filterOptions.ticketTypes} />
        </div>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Entradas</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Vendidas" value={String(inventory.sold)} />
            <StatTile label="Utilizadas" value={String(inventory.used)} />
            <StatTile label="Disponibles" value={String(inventory.available)} />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Dinero (según los filtros de arriba)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Ventas brutas" value={centsToPrice(totals.grossSales)} />
            <StatTile label="Reembolsos" value={centsToPrice(totals.refunds)} />
            <StatTile label="Comisión de plataforma" value={centsToPrice(totals.platformFees)} />
            <StatTile label="Balance del organizador" value={centsToPrice(totals.organizerBalance)} emphasis />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Payouts</h2>
          {!stripeAccount?.charges_enabled ? (
            <p className="text-sm text-muted-foreground">
              Conecta y activa tu cuenta de Stripe en{" "}
              <Link href="/organizador/pagos" className="text-primary hover:underline">
                Pagos
              </Link>{" "}
              para ver tus payouts acá.
            </p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay payouts registrados.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {payouts.map((p) => {
                const status = PAYOUT_STATUS_LABEL[p.status] ?? { label: p.status, variant: "neutral" as const };
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-muted-foreground">{formatDateShort(p.arrivalDate)}</span>
                    </div>
                    <span className="font-medium text-foreground">{formatPrice(p.amount / 100)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Historial de transacciones</h2>
            {history.rows.length > 0 && <ExportCsvButton filters={filters} />}
          </div>

          {history.rows.length === 0 ? (
            <EmptyState
              icon={<Receipt className="size-5" />}
              title="Sin transacciones"
              description="No hay movimientos de dinero para los filtros elegidos."
            />
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                {history.rows.map((row) => {
                  const info = TX_TYPE_LABEL[row.type] ?? { label: row.type, variant: "success" as const };
                  return (
                    <Card key={row.id}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Badge variant={info.variant}>{info.label}</Badge>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{row.eventTitle}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.ticketTypeName} · {formatDateShort(row.createdAt)} {formatTime(row.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium text-foreground">{centsToPrice(row.grossAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            Comisión {centsToPrice(row.platformFeeAmount)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  {page > 0 ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={buildPageHref(page - 1)}>Anterior</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Anterior
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Página {page + 1} de {totalPages}
                  </span>
                  {page < totalPages - 1 ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={buildPageHref(page + 1)}>Siguiente</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Siguiente
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatTile({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className={`text-xl font-semibold ${emphasis ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
