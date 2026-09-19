import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { getTicketTypeForPurchase, getTicketTypeInventory } from "@/lib/tickets";
import { getCategoryMeta } from "@/lib/categories";
import { formatInTimeZone } from "@/lib/timezone";
import { formatPrice } from "@/lib/format";
import { ReserveForm } from "./reserve-form";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  params: Promise<{ ticketTypeId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { ticketTypeId } = await params;
  const result = await getTicketTypeForPurchase(ticketTypeId);
  if (!result) notFound();

  const { ticketType, event } = result;
  const inventory = await getTicketTypeInventory(ticketTypeId);
  const category = getCategoryMeta(event.category);
  const maxSelectable = Math.min(inventory?.available ?? 0, ticketType.max_per_buyer);

  return (
    <div className="min-h-screen bg-background">
      <RealtimeRefresher
        channelName={`checkout-${ticketTypeId}`}
        subscriptions={[
          { table: "ticket_types", filter: `id=eq.${ticketTypeId}` },
          { table: "orders", filter: `ticket_type_id=eq.${ticketTypeId}` },
        ]}
      />
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Comprar entradas</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Link
          href={`/eventos/${event.slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al evento
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <Badge variant="brand">{category.label}</Badge>
        </div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">{event.title}</h1>
        <div className="mb-6 flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatInTimeZone(event.starts_at, event.timezone)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {event.venue_name} · {event.city}
          </span>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TicketIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{ticketType.name}</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{formatPrice(ticketType.price)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {inventory?.available ?? 0} disponibles · máx. {ticketType.max_per_buyer} por comprador
            </p>
            <ReserveForm ticketTypeId={ticketType.id} maxSelectable={maxSelectable} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
