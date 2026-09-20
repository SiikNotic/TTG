import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyStripeAccount } from "@/lib/payments";
import { StripeOnboardingStartForm, StripeOnboardingContinueForm } from "./stripe-onboarding-form";

export const dynamic = "force-dynamic";

export default async function OrganizerPaymentsPage() {
  const account = await getMyStripeAccount();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Cobros con Stripe</NavbarBrand>
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

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Cobros con Stripe</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Para recibir pagos de tus eventos, TTG usa Stripe Connect. El dinero de cada venta llega directo a tu
          cuenta de Stripe (menos la comisión de la plataforma); nosotros nunca la tocamos ni guardamos datos de
          tarjetas.
        </p>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
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
      </main>
    </div>
  );
}
