import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCover } from "@/components/discover/event-cover";
import { EventStatusBadge } from "@/components/discover/event-status-badge";
import { getCategoryMeta, type EventRecord } from "@/data/events";
import { formatDateShort, formatPrice, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventRecord;
  variant?: "default" | "featured";
  className?: string;
}

function EventCard({ event, variant = "default", className }: EventCardProps) {
  const category = getCategoryMeta(event.category);
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className={cn(
        "block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
        isFeatured ? "w-72 sm:w-80" : "w-full",
        className
      )}
    >
      <Card interactive className="flex h-full flex-col overflow-hidden">
        <EventCover category={event.category} className={isFeatured ? "aspect-[4/3]" : "aspect-video"} />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="brand">{category.label}</Badge>
            {event.status !== "disponible" ? (
              <EventStatusBadge status={event.status} />
            ) : event.lowStock ? (
              <Badge variant="warning">Últimos cupos</Badge>
            ) : null}
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>
              {formatDateShort(event.dateStart)} · {formatTime(event.dateStart)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venueName} · {event.city}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">
              {event.priceFrom === 0 ? "Gratis" : <>Desde {formatPrice(event.priceFrom)}</>}
            </span>
            {typeof event.distanceKm === "number" && (
              <span className="text-xs text-muted-foreground">a {event.distanceKm} km</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { EventCard };
