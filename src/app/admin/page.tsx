import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getPlatformOverview, getRiskSignals } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const currentUser = await getCurrentUser();
  const [overview, riskSignals] = await Promise.all([getPlatformOverview(), getRiskSignals()]);

  return (
    <AdminShell active="/admin" title="Overview">
      <p className="mb-6 text-sm text-muted-foreground">
        Sesión de administrador: {currentUser?.email}. Todos los números salen de la base de datos en el momento.
      </p>

      {riskSignals.length > 0 && (
        <Link
          href="/admin/riesgo"
          className="mb-6 flex items-center gap-2 rounded-md bg-danger-500/10 p-3 text-sm text-danger-600 hover:bg-danger-500/15"
        >
          <AlertTriangle className="size-4 shrink-0" />
          {riskSignals.length} señal(es) de riesgo activas — ver detalle en Fraude/Riesgo.
        </Link>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Usuarios</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Asistentes" value={overview.usersByRole.asistente} />
          <StatTile label="Organizadores" value={overview.usersByRole.organizador} />
          <StatTile label="Administradores" value={overview.usersByRole.admin} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Eventos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Publicados" value={overview.eventsByStatus.publicado} />
          <StatTile label="Borradores" value={overview.eventsByStatus.borrador} />
          <StatTile label="Pausados" value={overview.eventsByStatus.pausado} />
          <StatTile label="Cancelados" value={overview.eventsByStatus.cancelado} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Tickets</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(overview.ticketsByStatus).map(([status, count]) => (
            <StatTile key={status} label={status} value={count} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Dinero (histórico, toda la plataforma)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Ventas brutas" value={formatPrice(overview.grossSales / 100)} />
          <StatTile label="Reembolsos" value={formatPrice(overview.refunds / 100)} />
          <StatTile label="Comisión de plataforma" value={formatPrice(overview.platformFees / 100)} />
          <StatTile label="Organizadores habilitados en Stripe" value={overview.organizersWithStripeEnabled} />
        </div>
      </section>
    </AdminShell>
  );
}
