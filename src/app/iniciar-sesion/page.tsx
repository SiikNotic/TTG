import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { isSafeNextPath } from "@/lib/site-url";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const safeNext = isSafeNextPath(next) ? next : "/cuenta";

  return (
    <AuthShell
      title="Inicia sesión"
      description="Accede a tu cuenta de TTG."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
