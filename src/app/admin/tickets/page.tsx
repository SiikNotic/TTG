import { Ticket } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { lookupTickets } from "@/lib/admin";
import { formatDateShort, formatTime } from "@/lib/format";
import { TicketLookupForm } from "./lookup-form";
import { ForceStatusForm } from "./force-status-form";

export const dynamic = "force-dynamic";

interface TicketsPageProps {
  searchParams: Promise<{ q?: string }>;
}

const STATUS_BADGE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  used: "neutral",
  cancelled: "danger",
  refunded: "danger",
  expired: "warning",
  disputed: "warning",
};

export default async function AdminTicketsPage({ searchParams }: TicketsPageProps) {
  const { q } = await searchParams;
  const results = q ? await lookupTickets(q) : [];

  return (
    <AdminShell active="/admin/tickets" title="Tickets">
      <p className="mb-4 text-sm text-muted-foreground">
        Búsqueda de soporte: encuentra un ticket por su serial (TTG-XXXX) o su ID interno. Forzar un estado (p.
        ej. volver un ticket USADO a ACTIVO) queda registrado en el Audit Log con el motivo que escribas.
      </p>

      <div className="mb-4">
        <TicketLookupForm defaultQuery={q ?? ""} />
      </div>

      {q && results.length === 0 && (
        <EmptyState icon={<Ticket className="size-5" />} title="Sin resultados" description="No se encontró ningún ticket con ese código." />
      )}

      <div className="flex flex-col gap-1.5">
        {results.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[t.status] ?? "neutral"}>{t.status}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{t.serial}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{t.eventTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {t.ownerName ?? "Sin nombre"} · Emitido {formatDateShort(t.createdAt)} {formatTime(t.createdAt)}
                  {t.usedAt && ` · Usado ${formatDateShort(t.usedAt)} ${formatTime(t.usedAt)}`}
                </p>
              </div>
              <ForceStatusForm ticketId={t.id} currentStatus={t.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
