import Link from "next/link";
import { Plus, CalendarDays, Wallet, Store, CreditCard, UserCircle2, ArrowUpRight, Activity, Ticket } from "lucide-react";
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
                <Link href="/organizador/perfil">
                  <UserCircle2 /> Perfil
                </Link>
              </Button>
            </NavbarMobileMenu>
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium text-primary">Panel de organizador</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Hola, este es tu espacio.</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">Crea experiencias memorables y mira cómo crece tu comunidad.</p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-full">
            <Link href="/">Explorar eventos <ArrowUpRight data-icon="inline-end" /></Link>
          </Button>
        </header>

        <section aria-label="Resumen de eventos" className="mb-10 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.label} className="group rounded-2xl border border-border/70 bg-surface p-5 shadow-sm transition-all duration-base hover:-translate-y-1 hover:shadow-md">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  {index === 0 ? <Activity className="size-5" /> : index === 1 ? <CalendarDays className="size-5" /> : <Ticket className="size-5" />}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-border/70 bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div><h2 className="font-semibold text-foreground">Actividad reciente</h2><p className="text-sm text-muted-foreground">Tu actividad de eventos en un vistazo.</p></div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Todo en orden</span>
          </div>
          <div className="flex h-16 items-end gap-2" aria-label="Gráfico de actividad semanal">
            {[28, 42, 35, 58, 46, 68, 52, 76, 64, 88, 72, 94].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-primary/20 transition-all duration-base hover:bg-primary" style={{ height: `${height}%` }} />)}
          </div>
        </section>

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
