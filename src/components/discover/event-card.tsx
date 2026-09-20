import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventThumbnail } from "@/components/discover/event-thumbnail";
import { getCategoryMeta } from "@/lib/categories";
import { formatDateShortInTimeZone, formatTimeInTimeZone } from "@/lib/timezone";
import { formatPrice } from "@/lib/format";
import type { PublicEventSummary } from "@/lib/discovery";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: PublicEventSummary;
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
        <EventThumbnail
          category={event.category}
          coverImageUrl={event.coverImageUrl}
          alt=""
          className={isFeatured ? "aspect-[4/3]" : "aspect-video"}
          sizes={isFeatured ? "320px" : "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"}
        />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="brand">{category.label}</Badge>
            {event.soldOut ? (
              <Badge variant="warning">Agotado</Badge>
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
              {formatDateShortInTimeZone(event.startsAt, event.timezone)} ·{" "}
              {formatTimeInTimeZone(event.startsAt, event.timezone)}
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
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { EventCard };
