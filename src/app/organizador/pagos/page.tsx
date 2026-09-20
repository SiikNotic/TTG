import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyStripeAccount } from "@/lib/payments";
import { getMyPayoutSettings, getMyPayoutBalance } from "@/lib/payouts";
import { formatPrice, formatDateShort } from "@/lib/format";
import { StripeOnboardingStartForm, StripeOnboardingContinueForm } from "./stripe-onboarding-form";
import { PayoutMethodForm } from "./payout-method-form";

export const dynamic = "force-dynamic";

const PAYOUT_STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  processing: { label: "En proceso", variant: "warning" },
  completed: { label: "Completado", variant: "success" },
  failed: { label: "Fallido", variant: "danger" },
};

const PAYOUT_METHOD_LABEL: Record<string, string> = {
  paypal: "PayPal",
  ath_movil: "ATH Móvil",
};

export default async function OrganizerPaymentsPage() {
  const settings = await getMyPayoutSettings();
  const account = settings.method === "stripe" ? await getMyStripeAccount() : null;
  const { pendingBalance, history } = settings.method !== "stripe" ? await getMyPayoutBalance() : { pendingBalance: 0, history: [] };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Cobros</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Link
          href="/organizador"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Cómo quieres cobrar</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Los compradores siempre pagan con tarjeta a través de Stripe. Esto solo decide cómo te llega a ti tu
          parte de cada venta.
        </p>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <PayoutMethodForm
              currentMethod={settings.method}
              paypalEmail={settings.paypalEmail}
              athMovilPhone={settings.athMovilPhone}
            />
          </CardContent>
        </Card>

        {settings.method === "stripe" && (
          <Card>
            <CardHeader>
              <CardTitle>Cuenta bancaria (Stripe)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!account && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Todavía no conectaste una cuenta de Stripe. Sin esto, tus eventos no pueden vender entradas
                    pagas.
                  </p>
                  <StripeOnboardingStartForm />
                </>
              )}

              {account && !account.charges_enabled && (
                <>
                  <div className="flex items-center gap-2 text-warning-600">
                    <Clock className="size-5" />
                    <span className="text-sm font-medium">Onboarding incompleto</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Empezaste a conectar tu cuenta de Stripe pero falta completar algún paso (datos de la cuenta,
                    verificación de identidad, etc.). Hasta que Stripe confirme que está lista, tus eventos no
                    podrán cobrar.
                  </p>
                  <StripeOnboardingContinueForm />
                </>
              )}

              {account && account.charges_enabled && (
                <>
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 className="size-5" />
                    <span className="text-sm font-medium">Cuenta lista para recibir pagos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={account.payouts_enabled ? "success" : "warning"}>
                      {account.payouts_enabled ? "Payouts activos" : "Payouts pendientes"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cualquier cambio en tu cuenta de Stripe (por ejemplo si Stripe pide más información) se
                    refleja acá automáticamente.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {settings.method !== "stripe" && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Balance pendiente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{formatPrice(pendingBalance / 100)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {settings.method === "paypal"
                    ? "Se te paga automáticamente a tu PayPal cuando un administrador lo procese."
                    : "Un administrador te transfiere por ATH Móvil y lo marca como pagado acá."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial de pagos</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todavía no tienes pagos registrados.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {history.map((p) => {
                      const status = PAYOUT_STATUS_LABEL[p.status] ?? { label: p.status, variant: "neutral" as const };
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <span className="text-muted-foreground">
                              {PAYOUT_METHOD_LABEL[p.method] ?? p.method} · {formatDateShort(p.createdAt)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{formatPrice(p.amount / 100)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
