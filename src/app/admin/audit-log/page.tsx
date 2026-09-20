import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuditLog } from "@/lib/admin";
import { formatDateShort, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

interface AuditLogPageProps {
  searchParams: Promise<{ page?: string }>;
}

const ACTION_LABEL: Record<string, string> = {
  set_user_role: "Cambio de rol",
  set_event_status: "Cambio de estado de evento",
  pause_organizer_events: "Pausa de eventos de organizador",
  force_ticket_status: "Forzar estado de ticket",
};

export default async function AdminAuditLogPage({ searchParams }: AuditLogPageProps) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const { rows, totalCount, pageSize } = await getAuditLog(page);

  const buildHref = (targetPage: number) =>
    targetPage > 0 ? `/admin/audit-log?page=${targetPage}` : "/admin/audit-log";

  return (
    <AdminShell active="/admin/audit-log" title="Audit Log">
      <p className="mb-4 text-sm text-muted-foreground">
        Cada acción administrativa sensible (cambiar un rol, forzar el estado de un ticket, pausar los eventos
        de un organizador) queda acá, con quién la hizo, cuándo, y los detalles — se escribe en la misma
        transacción que el cambio, nunca por separado.
      </p>

      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{ACTION_LABEL[r.action] ?? r.action}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {r.targetType} · {r.targetId?.slice(0, 8)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {r.adminName ?? "Admin"} —{" "}
                  <span className="text-muted-foreground">{JSON.stringify(r.details)}</span>
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateShort(r.createdAt)} {formatTime(r.createdAt)}
              </span>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin acciones registradas todavía.</p>}
      </div>

      <Pagination page={page} totalCount={totalCount} pageSize={pageSize} buildHref={buildHref} />
    </AdminShell>
  );
}
