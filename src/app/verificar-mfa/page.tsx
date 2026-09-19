import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/server";
import { isSafeNextPath } from "@/lib/site-url";
import { ChallengeForm } from "./challenge-form";

export const dynamic = "force-dynamic";

interface VerifyMfaPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function VerifyMfaPage({ searchParams }: VerifyMfaPageProps) {
  const { next } = await searchParams;
  const safeNext = isSafeNextPath(next) ? next : "/admin";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/iniciar-sesion?next=${encodeURIComponent(safeNext)}`);

  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp.find((f) => f.status === "verified");

  if (!factor) {
    // No hay factor activo: no hay nada que desafiar, deja pasar.
    redirect(safeNext);
  }

  return (
    <AuthShell
      title="Verificación en dos pasos"
      description="Ingresa el código de tu app autenticadora para continuar."
    >
      <div className="mb-4 flex justify-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <KeyRound className="size-6" />
        </div>
      </div>
      <ChallengeForm factorId={factor.id} next={safeNext} />
    </AuthShell>
  );
}
