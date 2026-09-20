import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganizers } from "@/lib/admin";
import { PauseOrganizerForm } from "./pause-form";

export const dynamic = "force-dynamic";

export default async function AdminOrganizersPage() {
  const organizers = await getOrganizers();

  return (
    <AdminShell active="/admin/organizadores" title="Organizadores">
      <div className="flex flex-col gap-1.5">
        {organizers.map((o) => {
          const risky = o.soldCount >= 5 && o.refundRate >= 0.25;
          return (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {o.displayName || o.fullName || "Organizador"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.eventCount} evento(s) · {o.soldCount} venta(s) · {o.refundCount} reembolso(s)
                    {risky && <span className="ml-1 text-danger-600">({Math.round(o.refundRate * 100)}% reembolso)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={o.chargesEnabled ? "success" : "warning"}>
                    {o.chargesEnabled ? "Stripe activo" : "Sin Stripe"}
                  </Badge>
                  {o.stripeAccountId && (
                    <Link
                      href={`/admin/payouts?organizerId=${o.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Ver payouts
                    </Link>
                  )}
                  <PauseOrganizerForm organizerId={o.id} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {organizers.length === 0 && <p className="text-sm text-muted-foreground">Sin organizadores todavía.</p>}
      </div>
    </AdminShell>
  );
}
