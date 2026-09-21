import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { getMyOrganizerStaff } from "@/lib/staff";
import { getOrganizerEvents } from "@/lib/organizer";
import { InviteStaffForm } from "./invite-form";
import { RevokeStaffForm } from "./revoke-form";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  pendiente: { label: "Pendiente", variant: "warning" as const },
  aceptada: { label: "Activo", variant: "success" as const },
  rechazada: { label: "Rechazada", variant: "neutral" as const },
  revocada: { label: "Revocado", variant: "neutral" as const },
};

export default async function OrganizerStaffPage() {
  const [staff, events] = await Promise.all([getMyOrganizerStaff(), getOrganizerEvents()]);

  const pending = staff.filter((s) => s.status === "pendiente");
  const active = staff.filter((s) => s.status === "aceptada");
  const closed = staff.filter((s) => s.status === "rechazada" || s.status === "revocada");

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Staff</NavbarBrand>
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

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invita a alguien a escanear entradas de un evento puntual o de todo tu negocio. Necesita aceptar la
            invitación antes de poder escanear.
          </p>
        </header>

        <Card className="mb-8">
          <CardContent className="pt-5">
            <InviteStaffForm events={events.map((e) => ({ id: e.id, title: e.title }))} />
          </CardContent>
        </Card>

        {staff.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="Sin staff invitado"
            description="Cuando invites a alguien, aparecerá acá."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Pendientes ({pending.length})</h2>
                <div className="flex flex-col gap-2">
                  {pending.map((s) => (
                    <StaffRow key={s.id} row={s} action={<RevokeStaffForm invitationId={s.id} label="Cancelar" />} />
                  ))}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Activos ({active.length})</h2>
                <div className="flex flex-col gap-2">
                  {active.map((s) => (
                    <StaffRow key={s.id} row={s} action={<RevokeStaffForm invitationId={s.id} label="Revocar" />} />
                  ))}
                </div>
              </section>
            )}

            {closed.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Historial ({closed.length})</h2>
                <div className="flex flex-col gap-2">
                  {closed.map((s) => (
                    <StaffRow key={s.id} row={s} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StaffRow({
  row,
  action,
}: {
  row: { id: string; staff_display_name_snapshot: string; event_title_snapshot: string | null; status: keyof typeof STATUS_BADGE };
  action?: React.ReactNode;
}) {
  const badge = STATUS_BADGE[row.status];
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <p className="truncate text-sm font-medium text-foreground">{row.staff_display_name_snapshot}</p>
          <p className="text-xs text-muted-foreground">{row.event_title_snapshot ?? "Todo el negocio"}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
