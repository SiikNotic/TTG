import Link from "next/link";
import { ScanLine, Mail, Banknote } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state-message";
import { getMyStaffInvitations } from "@/lib/staff";
import { RespondInvitationForm } from "./respond-form";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const invitations = await getMyStaffInvitations();
  const pending = invitations.filter((i) => i.status === "pendiente");
  const active = invitations.filter((i) => i.status === "aceptada");

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Invitaciones</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invitaciones de staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando un organizador te invite a escanear entradas de su evento o negocio, aparece acá.
          </p>
        </header>

        {invitations.length === 0 ? (
          <EmptyState
            icon={<Mail className="size-5" />}
            title="Sin invitaciones"
            description="Todavía no tienes ninguna invitación de staff."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Pendientes ({pending.length})</h2>
                <div className="flex flex-col gap-2">
                  {pending.map((i) => (
                    <Card key={i.id}>
                      <CardContent className="flex items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <Badge variant="warning" className="mb-1">
                            Pendiente
                          </Badge>
                          <p className="truncate text-sm font-medium text-foreground">
                            {i.organizer_display_name_snapshot}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i.event_title_snapshot ?? "Todo el negocio"}
                          </p>
                        </div>
                        <RespondInvitationForm invitationId={i.id} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Activas ({active.length})</h2>
                <div className="flex flex-col gap-2">
                  {active.map((i) => (
                    <Card key={i.id}>
                      <CardContent className="flex items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <Badge variant="success" className="mb-1">
                            Activo
                          </Badge>
                          <p className="truncate text-sm font-medium text-foreground">
                            {i.organizer_display_name_snapshot}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {i.event_title_snapshot ?? "Todo el negocio"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={i.event_id ? `/organizador/venta-efectivo?eventId=${i.event_id}` : "/organizador/venta-efectivo"}
                            >
                              <Banknote className="size-4" /> Efectivo
                            </Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link href={i.event_id ? `/organizador/validar?eventId=${i.event_id}` : "/organizador/validar"}>
                              <ScanLine className="size-4" /> Escanear
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
