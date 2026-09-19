import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Empieza a descubrir o a organizar eventos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/iniciar-sesion" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
