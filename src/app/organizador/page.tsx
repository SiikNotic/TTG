import Link from "next/link";
import { Plus, CalendarDays, Wallet, Store, CreditCard, UserCircle2, Users, Banknote } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand, NavbarActions, NavbarMobileMenu } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/state-message";
import { OrganizerEventCard } from "@/components/organizer/organizer-event-card";
import { getOrganizerEvents } from "@/lib/organizer";

export const dynamic = "force-dynamic";

export default async function OrganizerDashboardPage() {
  const events = await getOrganizerEvents();
  const now = Date.now();
  const isPast = (e: (typeof events)[number]) => new Date(e.ends_at ?? e.starts_at).getTime() < now;

  const borradores = events.filter((e) => e.status === "borrador");
  const proximos = events.filter((e) => e.status !== "borrador" && !isPast(e));
  const finalizados = events.filter((e) => e.status !== "borrador" && isPast(e));

  const stats = [
    { label: "Borradores", value: borradores.length },
    { label: "Próximos", value: proximos.length },
    { label: "Finalizados", value: finalizados.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Panel de organizador</NavbarBrand>
          </Link>
          <NavbarActions>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/finanzas">Finanzas</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/recurrentes">Negocios</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/pagos">Pagos</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/staff">Staff</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/venta-efectivo">Efectivo</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex">
              <Link href="/organizador/perfil">Perfil</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/organizador/eventos/nuevo">
                <Plus className="size-4" /> Crear evento
              </Link>
            </Button>
            <NavbarMobileMenu>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/finanzas">
                  <Wallet /> Finanzas
                </Link>
              </Button>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/recurrentes">
                  <Store /> Negocios recurrentes
                </Link>
              </Button>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/pagos">
                  <CreditCard /> Pagos
                </Link>
              </Button>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/staff">
                  <Users /> Staff
                </Link>
              </Button>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/venta-efectivo">
                  <Banknote /> Venta en efectivo
                </Link>
              </Button>
              <Button asChild size="md" variant="ghost" className="w-full justify-start">
                <Link href="/organizador/perfil">
                  <UserCircle2 /> Perfil
                </Link>
              </Button>
            </NavbarMobileMenu>
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mis eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, publica y administra los eventos de tu organización.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="proximos">
          <TabsList>
            <TabsTrigger value="proximos">Próximos ({proximos.length})</TabsTrigger>
            <TabsTrigger value="borradores">Borradores ({borradores.length})</TabsTrigger>
            <TabsTrigger value="finalizados">Finalizados ({finalizados.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="proximos">
            <EventList
              events={proximos}
              emptyTitle="Sin eventos próximos"
              emptyDescription="Publica un evento para que aparezca aquí."
            />
          </TabsContent>
          <TabsContent value="borradores">
            <EventList
              events={borradores}
              emptyTitle="Sin borradores"
              emptyDescription="Los eventos que aún no publicas aparecen aquí."
            />
          </TabsContent>
          <TabsContent value="finalizados">
            <EventList
              events={finalizados}
              emptyTitle="Sin eventos finalizados"
              emptyDescription="Cuando un evento termine, aparecerá en esta lista."
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EventList({
  events,
  emptyTitle,
  emptyDescription,
}: {
  events: Awaited<ReturnType<typeof getOrganizerEvents>>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (events.length === 0) {
    return (
      <EmptyState icon={<CalendarDays className="size-5" />} title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <OrganizerEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
