import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Elige una nueva contraseña" description="Este enlace es de un solo uso.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
