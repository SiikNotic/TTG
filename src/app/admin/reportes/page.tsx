import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getReports } from "@/lib/admin";
import { getCategoryMeta, type EventCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

function centsToPrice(cents: number) {
  return formatPrice(cents / 100);
}

export default async function AdminReportsPage() {
  const { topEventsByRevenue, revenueByCategory } = await getReports();

  return (
    <AdminShell active="/admin/reportes" title="Reportes">
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Top 10 eventos por ventas brutas</h2>
        {topEventsByRevenue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ventas todavía.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {topEventsByRevenue.map((e, i) => (
              <Card key={e.eventId}>
                <CardContent className="flex items-center justify-between gap-2 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-medium text-muted-foreground">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.ticketsSold} venta(s) · {centsToPrice(e.refunds)} reembolsado
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">{centsToPrice(e.grossSales)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Ventas brutas por categoría</h2>
        {revenueByCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ventas todavía.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {revenueByCategory.map((c) => (
              <Card key={c.category}>
                <CardContent className="flex items-center justify-between gap-2 py-3">
                  <p className="text-sm font-medium text-foreground">{getCategoryMeta(c.category as EventCategory).label}</p>
                  <p className="font-medium text-foreground">{centsToPrice(c.grossSales)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
