import { Construction } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPlaceholderPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Administración</NavbarBrand>
        </NavbarInner>
      </Navbar>
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Construction className="size-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Panel de administración en construcción</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tu cuenta ({currentUser?.email}) ya pasó la verificación de rol y MFA. El panel completo
          se construye en una etapa posterior.
        </p>
      </main>
    </div>
  );
}
