import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizerProfile } from "@/lib/organizer";
import { OrganizerProfileForm } from "./organizer-profile-form";
import { LogoForm } from "./logo-form";

export const dynamic = "force-dynamic";

export default async function OrganizerProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/iniciar-sesion?next=/organizador/perfil");

  const profile = await getOrganizerProfile(currentUser.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Perfil de organizador</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/organizador"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Perfil de organizador</h1>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoForm logoUrl={profile?.logo_url ?? null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información pública</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizerProfileForm
                displayName={profile?.display_name ?? currentUser.fullName ?? ""}
                bio={profile?.bio ?? ""}
                websiteUrl={profile?.website_url ?? ""}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
