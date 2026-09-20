import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function ConfigRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-none">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ConfiguredBadge({ configured }: { configured: boolean }) {
  return <Badge variant={configured ? "success" : "danger"}>{configured ? "Configurado" : "Falta configurar"}</Badge>;
}

export default function AdminConfigPage() {
  const platformFeeBps = Number(process.env.PLATFORM_FEE_BPS ?? "500");

  return (
    <AdminShell active="/admin/configuracion" title="Configuración">
      <p className="mb-4 text-sm text-muted-foreground">
        Solo lectura: son valores de variables de entorno del servidor. Nunca se muestra el valor de un secreto,
        solo si está configurado o no.
      </p>

      <Card>
        <CardContent className="divide-y-0 py-2">
          <ConfigRow label="Comisión de plataforma" value={`${(platformFeeBps / 100).toFixed(2)}%`} />
          <ConfigRow label="Clave secreta de Stripe" value={<ConfiguredBadge configured={!!process.env.STRIPE_SECRET_KEY} />} />
          <ConfigRow
            label="Secreto de firma de webhooks de Stripe"
            value={<ConfiguredBadge configured={!!process.env.STRIPE_WEBHOOK_SECRET} />}
          />
          <ConfigRow
            label="Clave service_role de Supabase"
            value={<ConfiguredBadge configured={!!process.env.SUPABASE_SERVICE_ROLE_KEY} />}
          />
          <ConfigRow label="URL del proyecto de Supabase" value={process.env.NEXT_PUBLIC_SUPABASE_URL ?? "—"} />
          <ConfigRow label="URL del sitio" value={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000 (por defecto)"} />
          <ConfigRow label="Entorno" value={process.env.NODE_ENV ?? "—"} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
