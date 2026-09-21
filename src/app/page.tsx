import { Navbar, NavbarInner, NavbarBrand, NavbarActions } from "@/components/ui/navbar";
import { BrandMark } from "@/components/ui/brand-mark";
import { NavbarAuthActions } from "@/components/auth/navbar-auth-actions";
import { EventDiscovery } from "@/components/discover/event-discovery";
import { getPublicUpcomingEvents } from "@/lib/discovery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getPublicUpcomingEvents();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>
            <BrandMark />
            TTG
          </NavbarBrand>
          <NavbarActions>
            <NavbarAuthActions />
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Descubre qué está pasando
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Explora eventos de música, cultura, deporte y comunidad.
          </p>
        </header>

        <EventDiscovery events={events} />
      </main>
    </div>
  );
}
