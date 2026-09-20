import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTransactions } from "@/lib/admin";
import { formatPrice, formatDateShort, formatTime } from "@/lib/format";
import { TransactionFiltersForm } from "../transacciones/filters-form";

export const dynamic = "force-dynamic";

interface RefundsPageProps {
  searchParams: Promise<{ search?: string; from?: string; to?: string; page?: string }>;
}

function centsToPrice(cents: number) {
  return formatPrice(cents / 100);
}

export default async function AdminRefundsPage({ searchParams }: RefundsPageProps) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const { rows, totalCount, pageSize } = await getTransactions(
    { search: sp.search, dateFrom: sp.from, dateTo: sp.to, transactionType: "refund" },
    page
  );

  const totalRefunded = rows.reduce((sum, r) => sum + Math.abs(r.grossAmount), 0);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (targetPage > 0) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/reembolsos?${qs}` : "/admin/reembolsos";
  };

  return (
    <AdminShell active="/admin/reembolsos" title="Reembolsos">
      <div className="mb-4">
        <TransactionFiltersForm
          basePath="/admin/reembolsos"
          defaultSearch={sp.search ?? ""}
          defaultType="all"
          defaultFrom={sp.from ?? ""}
          defaultTo={sp.to ?? ""}
        />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Reembolsado en esta página: <span className="font-medium text-foreground">{centsToPrice(totalRefunded)}</span>
      </p>

      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Badge variant="danger">Reembolso</Badge>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{r.eventTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.organizerName ?? "—"} · {formatDateShort(r.createdAt)} {formatTime(r.createdAt)}
                  </p>
                </div>
              </div>
              <p className="font-medium text-foreground">{centsToPrice(Math.abs(r.grossAmount))}</p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin reembolsos.</p>}
      </div>

      <Pagination page={page} totalCount={totalCount} pageSize={pageSize} buildHref={buildHref} />
    </AdminShell>
  );
}
