import { redirect } from "next/navigation";
import { MailWarning, MailCheck } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, roleLabel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AvatarForm } from "./avatar-form";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { SessionActions } from "./session-actions";
import { MfaSection } from "./mfa-section";

export const dynamic = "force-dynamic";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function AccountPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/iniciar-sesion?next=/cuenta");

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const emailConfirmed = Boolean(authUser?.email_confirmed_at);

  let adminFactor: { id: string; friendlyName: string | null } | null = null;
  if (currentUser.role === "admin") {
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp.find((f) => f.status === "verified");
    adminFactor = verified ? { id: verified.id, friendlyName: verified.friendly_name ?? null } : null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Mi cuenta</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mi cuenta</h1>
            <p className="mt-1 text-sm text-muted-foreground">{currentUser.email}</p>
          </div>
          <Badge variant="brand">{roleLabel(currentUser.role)}</Badge>
        </header>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto de perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarForm
                avatarUrl={currentUser.avatarUrl}
                initials={getInitials(currentUser.fullName, currentUser.email)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm fullName={currentUser.fullName} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Correo</CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                {emailConfirmed ? (
                  <>
                    <MailCheck className="size-3.5 text-success-500" /> Verificado
                  </>
                ) : (
                  <>
                    <MailWarning className="size-3.5 text-warning-500" /> Sin verificar
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {currentUser.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Verificación en dos pasos</CardTitle>
                <CardDescription>Requerida para acceder al panel de administración.</CardDescription>
              </CardHeader>
              <CardContent>
                <MfaSection factor={adminFactor} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionActions />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
