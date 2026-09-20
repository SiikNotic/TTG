import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganizers, getOrganizerPayoutBalances, getRecentOrganizerPayouts } from "@/lib/admin";
import { getOrganizerPayouts } from "@/lib/payments";
import { formatPrice, formatDateShort } from "@/lib/format";
import { TriggerPaypalPayoutForm, MarkAthMovilPaidForm, RefreshPaypalStatusForm } from "./manual-payout-forms";

export const dynamic = "force-dynamic";

interface PayoutsPageProps {
  searchParams: Promise<{ organizerId?: string }>;
}

const STRIPE_PAYOUT_STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  paid: { label: "Pagado", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  in_transit: { label: "En camino", variant: "warning" },
  failed: { label: "Fallido", variant: "danger" },
  canceled: { label: "Cancelado", variant: "neutral" },
};

const MANUAL_PAYOUT_STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  processing: { label: "En proceso", variant: "warning" },
  completed: { label: "Completado", variant: "success" },
  failed: { label: "Fallido", variant: "danger" },
};

const METHOD_LABEL: Record<string, string> = { paypal: "PayPal", ath_movil: "ATH Móvil" };

export default async function AdminPayoutsPage({ searchParams }: PayoutsPageProps) {
  const { organizerId } = await searchParams;
  const [organizers, payoutBalances, recentPayouts] = await Promise.all([
    getOrganizers(),
    getOrganizerPayoutBalances(),
    getRecentOrganizerPayouts(),
  ]);

  const stripeOrganizers = organizers.filter((o) => o.stripeAccountId);
  const selected = organizerId ? stripeOrganizers.find((o) => o.id === organizerId) : null;
  const stripePayouts = selected?.stripeAccountId ? await getOrganizerPayouts(selected.stripeAccountId) : [];

  return (
    <AdminShell active="/admin/payouts" title="Payouts">
      <div className="mb-8">
        <h2 className="mb-1 text-sm font-semibold text-foreground">PayPal y ATH Móvil pendientes</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Este dinero está en el balance de la plataforma (no se transfirió solo, a diferencia de Stripe): hay que
          pagarle al organizador a mano acá.
        </p>
        {payoutBalances.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ningún organizador usa PayPal o ATH Móvil todavía.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payoutBalances.map((o) => (
              <Card key={o.organizerId}>
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{o.displayName ?? "Organizador"}</p>
                      <p className="text-xs text-muted-foreground">
                        {METHOD_LABEL[o.method ?? ""] ?? o.method} ·{" "}
                        {o.method === "paypal" ? o.paypalEmail : o.athMovilPhone}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{formatPrice(o.pendingBalance / 100)}</span>
                  </div>
                  {o.pendingBalance > 0 &&
                    (o.method === "paypal" ? (
                      <TriggerPaypalPayoutForm organizerId={o.organizerId} />
                    ) : (
                      <MarkAthMovilPaidForm organizerId={o.organizerId} pendingBalance={o.pendingBalance} />
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Historial reciente (PayPal / ATH Móvil)</h2>
        {recentPayouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin pagos registrados todavía.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentPayouts.map((p) => {
              const status = MANUAL_PAYOUT_STATUS_LABEL[p.status] ?? { label: p.status, variant: "neutral" as const };
              return (
                <Card key={p.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.organizerName ?? "Organizador"}</p>
                        <p className="text-xs text-muted-foreground">
                          {METHOD_LABEL[p.method]} · {formatDateShort(p.createdAt)}
                          {p.reference && ` · Ref: ${p.reference}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{formatPrice(p.amount / 100)}</span>
                      {p.method === "paypal" && p.status === "processing" && (
                        <RefreshPaypalStatusForm payoutId={p.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-foreground">Payouts de Stripe</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Se leen en vivo de Stripe (no hay copia local que se desactualice). Elige un organizador para ver los
          suyos.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {stripeOrganizers.map((o) => (
            <Link key={o.id} href={`/admin/payouts?organizerId=${o.id}`}>
              <Badge variant={selected?.id === o.id ? "brand" : "neutral"}>{o.displayName ?? o.fullName ?? "Organizador"}</Badge>
            </Link>
          ))}
          {stripeOrganizers.length === 0 && (
            <p className="text-sm text-muted-foreground">Ningún organizador tiene Stripe conectado todavía.</p>
          )}
        </div>

        {selected && (
          <div className="flex flex-col gap-1.5">
            {stripePayouts.length === 0 && <p className="text-sm text-muted-foreground">Sin payouts registrados.</p>}
            {stripePayouts.map((p) => {
              const status = STRIPE_PAYOUT_STATUS_LABEL[p.status] ?? { label: p.status, variant: "neutral" as const };
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
      </div>
    </AdminShell>
  );
}
