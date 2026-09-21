import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-message";
import { getEventForOrganizer } from "@/lib/organizer";
import { getScannableEvents } from "@/lib/staff";
import { getCurrentUser } from "@/lib/auth";
import { formatInTimeZone } from "@/lib/timezone";
import { Scanner } from "./scanner";

export const dynamic = "force-dynamic";

interface ValidatePageProps {
  searchParams: Promise<{ eventId?: string }>;
}

export default async function ValidateTicketPage({ searchParams }: ValidatePageProps) {
  const { eventId } = await searchParams;
  const currentUser = await getCurrentUser();
  // Un staff invitado (role='asistente', por ejemplo) no tiene acceso al
  // resto de /organizador: volver ahí le daría "no autorizado".
  const backHref = currentUser?.role === "organizador" || currentUser?.role === "admin" ? "/organizador" : "/";

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Validar entrada</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-md px-4 py-8 sm:px-6">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        {eventId ? <EventScanner eventId={eventId} /> : <EventPicker />}
      </main>
    </div>
  );
}

async function EventScanner({ eventId }: { eventId: string }) {
  const result = await getEventForOrganizer(eventId);
  if (!result) notFound();

  return (
    <>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Escaneando para</p>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">{result.event.title}</h1>
      <Scanner eventId={eventId} eventTitle={result.event.title} />
      <div className="mt-6 text-center">
        <Link href="/organizador/validar" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          Cambiar de evento
        </Link>
      </div>
    </>
  );
}

async function EventPicker() {
  const events = await getScannableEvents();

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">¿Para qué evento?</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Elige el evento para el que vas a validar entradas. Un ticket de otro evento se rechaza automáticamente.
      </p>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title="No tienes eventos publicados"
          description="Publica un evento para poder validar sus entradas acá."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <Link key={event.id} href={`/organizador/validar?eventId=${event.id}`} className="block">
              <Card interactive>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{formatInTimeZone(event.starts_at, event.timezone)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
