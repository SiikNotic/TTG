import Link from "next/link";
import { User, Ticket, LayoutDashboard, ScanLine, Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getStaffQuickAccessCounts } from "@/lib/staff";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

async function NavbarAuthActions() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <>
        <Button asChild size="sm" variant="ghost">
          <Link href="/iniciar-sesion">Iniciar sesión</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/registro">Crear cuenta</Link>
        </Button>
      </>
    );
  }

  const { pendingInvitations, acceptedMemberships } = await getStaffQuickAccessCounts(currentUser.id);

  return (
    <>
      {currentUser.role === "organizador" && (
        <Button asChild size="sm" variant="ghost" className="gap-1.5">
          <Link href="/organizador">
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">Panel</span>
          </Link>
        </Button>
      )}
      {currentUser.role === "admin" && (
        <Button asChild size="sm" variant="ghost" className="gap-1.5">
          <Link href="/admin">
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">Panel admin</span>
          </Link>
        </Button>
      )}
      {pendingInvitations > 0 ? (
        <Button asChild size="sm" variant="ghost" className="gap-1.5">
          <Link href="/invitaciones">
            <Mail className="size-4" />
            <span className="hidden sm:inline">Invitaciones</span>
          </Link>
        </Button>
      ) : (
        acceptedMemberships > 0 && (
          <Button asChild size="sm" variant="ghost" className="gap-1.5">
            <Link href="/organizador/validar">
              <ScanLine className="size-4" />
              <span className="hidden sm:inline">Escanear</span>
            </Link>
          </Button>
        )
      )}
      <Button asChild size="sm" variant="ghost" className="gap-1.5">
        <Link href="/mis-tickets">
          <Ticket className="size-4" />
          <span className="hidden sm:inline">Mis entradas</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="ghost" className="gap-1.5">
        <Link href="/cuenta">
          {currentUser.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage.
            <img src={currentUser.avatarUrl} alt="" className="size-5 rounded-full object-cover" />
          ) : (
            <User className="size-4" />
          )}
          <span className="hidden sm:inline">{currentUser.fullName || "Mi cuenta"}</span>
        </Link>
      </Button>
      <form action={signOut}>
        <Button type="submit" size="sm" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </>
  );
}

export { NavbarAuthActions };
