import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganizers } from "@/lib/admin";
import { getOrganizerPayouts } from "@/lib/payments";
import { formatPrice, formatDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PayoutsPageProps {
  searchParams: Promise<{ organizerId?: string }>;
}

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  paid: { label: "Pagado", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  in_transit: { label: "En camino", variant: "warning" },
  failed: { label: "Fallido", variant: "danger" },
  canceled: { label: "Cancelado", variant: "neutral" },
};

export default async function AdminPayoutsPage({ searchParams }: PayoutsPageProps) {
  const { organizerId } = await searchParams;
  const organizers = (await getOrganizers()).filter((o) => o.stripeAccountId);
  const selected = organizerId ? organizers.find((o) => o.id === organizerId) : null;
  const payouts = selected?.stripeAccountId ? await getOrganizerPayouts(selected.stripeAccountId) : [];

  return (
    <AdminShell active="/admin/payouts" title="Payouts">
      <p className="mb-4 text-sm text-muted-foreground">
        Los payouts se leen en vivo de Stripe (no hay copia local que se desactualice). Elige un organizador para
        ver los suyos.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {organizers.map((o) => (
          <Link key={o.id} href={`/admin/payouts?organizerId=${o.id}`}>
            <Badge variant={selected?.id === o.id ? "brand" : "neutral"}>{o.displayName ?? o.fullName ?? "Organizador"}</Badge>
          </Link>
        ))}
        {organizers.length === 0 && <p className="text-sm text-muted-foreground">Ningún organizador tiene Stripe conectado todavía.</p>}
      </div>

      {selected && (
        <div className="flex flex-col gap-1.5">
          {payouts.length === 0 && <p className="text-sm text-muted-foreground">Sin payouts registrados.</p>}
          {payouts.map((p) => {
            const status = STATUS_LABEL[p.status] ?? { label: p.status, variant: "neutral" as const };
            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-2 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-muted-foreground">{formatDateShort(p.arrivalDate)}</span>
                  </div>
                  <span className="font-medium text-foreground">{formatPrice(p.amount / 100)}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
