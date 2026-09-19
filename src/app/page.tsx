import { Ticket, MapPin } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand, NavbarActions } from "@/components/ui/navbar";
import { NavbarAuthActions } from "@/components/auth/navbar-auth-actions";
import { DemoDataBanner } from "@/components/discover/demo-data-banner";
import { EventDiscovery } from "@/components/discover/event-discovery";
import { getFeaturedEvents, getUpcomingEvents } from "@/data/events";

export const dynamic = "force-dynamic";

export default function Home() {
  const featuredEvents = getFeaturedEvents();
  const events = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Ticket className="size-4" />
            </span>
            TTG
          </NavbarBrand>
          <NavbarActions>
            <NavbarAuthActions />
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <DemoDataBanner />
        </div>

        <header className="mb-8">
          <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span>Mostrando eventos cerca de Bogotá</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Descubre qué está pasando
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Explora eventos de música, cultura, deporte y comunidad cerca de ti.
          </p>
        </header>

        <EventDiscovery featuredEvents={featuredEvents} events={events} />
      </main>
    </div>
  );
}
