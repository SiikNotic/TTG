import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/lib/admin";
import { formatInTimeZone } from "@/lib/timezone";
import { EventStatusForm } from "./status-form";
import { EventSearchForm } from "./search-form";

export const dynamic = "force-dynamic";

interface EventsPageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

const STATUS_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  publicado: "success",
  pausado: "warning",
  cancelado: "danger",
  borrador: "neutral",
};

export default async function AdminEventsPage({ searchParams }: EventsPageProps) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const status = sp.status as "borrador" | "publicado" | "pausado" | "cancelado" | undefined;
  const { rows, totalCount, pageSize } = await getEvents({ search: sp.search, status }, page);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.status) params.set("status", sp.status);
    if (targetPage > 0) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/eventos?${qs}` : "/admin/eventos";
  };

  return (
    <AdminShell active="/admin/eventos" title="Eventos">
      <div className="mb-4">
        <EventSearchForm defaultSearch={sp.search ?? ""} defaultStatus={sp.status ?? "all"} />
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[e.status]}>{e.status}</Badge>
                  <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.organizerName ?? "Organizador"} · {formatInTimeZone(e.startsAt, e.timezone)}
                </p>
              </div>
              <EventStatusForm eventId={e.id} currentStatus={e.status} />
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin resultados.</p>}
      </div>

      <Pagination page={page} totalCount={totalCount} pageSize={pageSize} buildHref={buildHref} />
    </AdminShell>
  );
}
