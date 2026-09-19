import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NotAuthorizedPage() {
  return (
    <AuthShell title="No tienes acceso" description="Tu cuenta no tiene permisos para ver esta página.">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-warning-500/10 text-warning-500">
          <ShieldAlert className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Si crees que esto es un error, contacta a quien administra tu cuenta.
        </p>
        <Button asChild className="w-full">
          <Link href="/cuenta">Ir a mi cuenta</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
