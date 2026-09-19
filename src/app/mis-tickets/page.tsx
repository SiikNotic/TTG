import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { EventCover } from "@/components/discover/event-cover";
import { getMyTickets } from "@/lib/tickets";
import { getCategoryMeta } from "@/lib/categories";
import { formatInTimeZone } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  active: { label: "Activa", variant: "success" },
  used: { label: "Usada", variant: "neutral" },
  cancelled: { label: "Cancelada", variant: "danger" },
  refunded: { label: "Reembolsada", variant: "danger" },
  expired: { label: "Expirada", variant: "warning" },
};

export default async function MyTicketsPage() {
  const tickets = await getMyTickets();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Mis entradas</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Mis entradas</h1>

        {tickets.length === 0 ? (
          <EmptyState
            icon={<TicketIcon className="size-5" />}
            title="Aún no tienes entradas"
            description="Cuando compres una entrada, aparecerá aquí."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => {
              const info = ticket.ticket_types as unknown as {
                name: string;
                events: {
                  title: string;
                  starts_at: string;
                  timezone: string;
                  venue_name: string;
                  city: string;
                  category: Parameters<typeof getCategoryMeta>[0];
                };
              } | null;
              const event = info?.events;
              const status = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.active!;

              return (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block rounded-lg">
                  <Card interactive className="flex items-center gap-4 overflow-hidden p-0">
                    <div className="size-20 shrink-0">
                      {event && <EventCover category={event.category} className="size-full" iconClassName="size-5" />}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{ticket.serial}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{event?.title ?? "Evento"}</p>
                      {event && (
                        <p className="text-xs text-muted-foreground">{formatInTimeZone(event.starts_at, event.timezone)}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
