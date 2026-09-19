import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendForm } from "./resend-form";

export const dynamic = "force-dynamic";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email = "" } = await searchParams;

  return (
    <AuthShell title="Revisa tu correo" description="Te enviamos un enlace para confirmar tu cuenta.">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              Enviamos un enlace de confirmación a <span className="font-medium text-foreground">{email}</span>.
            </>
          ) : (
            "Enviamos un enlace de confirmación a tu correo."
          )}{" "}
          Ábrelo para activar tu cuenta.
        </p>
        {email && <ResendForm email={email} />}
      </div>
    </AuthShell>
  );
}
