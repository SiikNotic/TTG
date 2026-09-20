import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRiskSignals } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminRiskPage() {
  const signals = await getRiskSignals();

  return (
    <AdminShell active="/admin/riesgo" title="Fraude / Riesgo">
      <p className="mb-6 text-sm text-muted-foreground">
        Señales calculadas sobre datos reales: tasa de reembolso por organizador, disputas (chargebacks) por
        evento, y patrones de escaneo en la puerta (muchos intentos fallidos seguidos, o el mismo ticket
        escaneado varias veces después de estar USADO).
      </p>

      {signals.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md bg-success-500/10 p-4 text-sm text-success-600">
          <ShieldCheck className="size-5" />
          Sin señales de riesgo activas por ahora.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {signals.map((s, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-3 py-3">
                <AlertTriangle className={`mt-0.5 size-4 shrink-0 ${s.severity === "danger" ? "text-danger-500" : "text-warning-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={s.severity}>{s.title}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{s.description}</p>
                </div>
                <Link href={s.targetHref} className="shrink-0 text-xs text-primary hover:underline">
                  Ver
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
