import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AuthErrorPage() {
  return (
    <AuthShell title="Enlace inválido o expirado" description="No pudimos confirmar esta solicitud.">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-500/10 text-danger-500">
          <AlertTriangle className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          El enlace pudo haber expirado o ya fue usado. Solicita uno nuevo para continuar.
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary" className="flex-1">
            <Link href="/recuperar-contrasena">Recuperar contraseña</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/iniciar-sesion">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
