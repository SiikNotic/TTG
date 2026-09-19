import Link from "next/link";
import { CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCover } from "@/components/discover/event-cover";
import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { getCategoryMeta } from "@/lib/categories";
import { formatInTimeZone } from "@/lib/timezone";
import type { OrganizerEventWithCounts } from "@/lib/organizer";

function OrganizerEventCard({ event }: { event: OrganizerEventWithCounts }) {
  const category = getCategoryMeta(event.category);
  const isPast = new Date(event.ends_at ?? event.starts_at).getTime() < Date.now();

  return (
    <Link
      href={`/organizador/eventos/${event.id}`}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card interactive className="flex flex-col gap-0 overflow-hidden sm:flex-row">
        <div className="sm:w-48 sm:shrink-0">
          {event.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- viene de Supabase Storage.
            <img src={event.cover_image_url} alt="" className="aspect-video size-full object-cover sm:aspect-square" />
          ) : (
            <EventCover category={event.category} className="aspect-video size-full sm:aspect-square" iconClassName="size-6" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{category.label}</Badge>
            <EventStatusBadge status={event.status} isPast={isPast} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatInTimeZone(event.starts_at, event.timezone)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {event.venue_name || "Sin lugar"} · {event.city || "—"}
            </span>
            <span className="flex items-center gap-1">
              <TicketIcon className="size-3.5" />
              {event.ticket_type_count} tipo{event.ticket_type_count === 1 ? "" : "s"} de entrada
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { OrganizerEventCard };
