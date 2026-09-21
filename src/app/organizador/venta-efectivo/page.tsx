import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-message";
import { getEventForOrganizer } from "@/lib/organizer";
import { getScannableEvents } from "@/lib/staff";
import { getEventTicketTypesWithInventory } from "@/lib/tickets";
import { getCurrentUser } from "@/lib/auth";
import { formatInTimeZone } from "@/lib/timezone";
import { CashSaleForm } from "./cash-sale-form";

export const dynamic = "force-dynamic";

interface CashSalePageProps {
  searchParams: Promise<{ eventId?: string }>;
}

export default async function CashSalePage({ searchParams }: CashSalePageProps) {
  const { eventId } = await searchParams;
  const currentUser = await getCurrentUser();
  // Igual que en /organizador/validar: un staff invitado (sin rol
  // 'organizador') no tiene acceso al resto de /organizador.
  const backHref = currentUser?.role === "organizador" || currentUser?.role === "admin" ? "/organizador" : "/";

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Venta en efectivo</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-md px-4 py-8 sm:px-6">
        <Link
          href={eventId ? "/organizador/venta-efectivo" : backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {eventId ? "Cambiar de evento" : "Volver"}
        </Link>

        {eventId ? <TicketTypePicker eventId={eventId} /> : <EventPicker />}
      </main>
    </div>
  );
}

async function TicketTypePicker({ eventId }: { eventId: string }) {
  const result = await getEventForOrganizer(eventId);
  if (!result) notFound();

  const ticketTypesWithInventory = await getEventTicketTypesWithInventory(eventId);

  return (
    <>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Vendiendo para</p>
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-foreground">{result.event.title}</h1>
      <CashSaleForm
        ticketTypes={ticketTypesWithInventory.map(({ ticketType, inventory }) => ({
          id: ticketType.id,
          name: ticketType.name,
          price: ticketType.price,
          available: inventory?.available ?? 0,
        }))}
      />
    </>
  );
}

async function EventPicker() {
  const events = await getScannableEvents();

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">¿Para qué evento?</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Elige el evento para el que vas a registrar una venta en efectivo.
      </p>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-5" />}
          title="No tienes eventos publicados"
          description="Publica un evento para poder vender entradas en efectivo acá."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <Link key={event.id} href={`/organizador/venta-efectivo?eventId=${event.id}`} className="block">
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
