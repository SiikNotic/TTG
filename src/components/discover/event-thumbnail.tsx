import Image from "next/image";
import { EventCover } from "@/components/discover/event-cover";
import type { EventCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface EventThumbnailProps {
  category: EventCategory;
  coverImageUrl: string | null;
  alt: string;
  className: string;
  iconClassName?: string;
  sizes: string;
  priority?: boolean;
}

/**
 * Muestra la portada real del evento (Storage de Supabase) cuando existe,
 * y si no, el gradiente de respaldo por categoría. `className` debe traer
 * el aspect-ratio: con imagen real se usa `fill`, que necesita un padre con
 * tamaño definido.
 */
function EventThumbnail({
  category,
  coverImageUrl,
  alt,
  className,
  iconClassName,
  sizes,
  priority,
}: EventThumbnailProps) {
  if (!coverImageUrl) {
    return <EventCover category={category} className={className} iconClassName={iconClassName} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-neutral-900", className)}>
      <Image src={coverImageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

export { EventThumbnail };
