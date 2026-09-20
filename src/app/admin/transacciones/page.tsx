import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTransactions, type AdminTransactionFilters } from "@/lib/admin";
import { formatPrice, formatDateShort, formatTime } from "@/lib/format";
import { TransactionFiltersForm } from "./filters-form";

export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams: Promise<{ search?: string; type?: string; from?: string; to?: string; page?: string }>;
}

const TYPE_LABEL: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  charge: { label: "Cobro", variant: "success" },
  refund: { label: "Reembolso", variant: "danger" },
  dispute: { label: "Disputa", variant: "warning" },
};

function centsToPrice(cents: number) {
  return formatPrice(cents / 100);
}

export default async function AdminTransactionsPage({ searchParams }: TransactionsPageProps) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const filters: AdminTransactionFilters = {
    search: sp.search,
    transactionType: sp.type as AdminTransactionFilters["transactionType"],
    dateFrom: sp.from,
    dateTo: sp.to,
  };
  const { rows, totalCount, pageSize } = await getTransactions(filters, page);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.type) params.set("type", sp.type);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (targetPage > 0) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/transacciones?${qs}` : "/admin/transacciones";
  };

  return (
    <AdminShell active="/admin/transacciones" title="Transacciones">
      <div className="mb-4">
        <TransactionFiltersForm
          basePath="/admin/transacciones"
          defaultSearch={sp.search ?? ""}
          defaultType={sp.type ?? "all"}
          defaultFrom={sp.from ?? ""}
          defaultTo={sp.to ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((r) => {
          const info = TYPE_LABEL[r.type] ?? { label: r.type, variant: "success" as const };
          return (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant={info.variant}>{info.label}</Badge>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{r.eventTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.organizerName ?? "—"} · {formatDateShort(r.createdAt)} {formatTime(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-foreground">{centsToPrice(r.grossAmount)}</p>
                  <p className="text-xs text-muted-foreground">Comisión {centsToPrice(r.platformFeeAmount)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin transacciones.</p>}
      </div>

      <Pagination page={page} totalCount={totalCount} pageSize={pageSize} buildHref={buildHref} />
    </AdminShell>
  );
}
