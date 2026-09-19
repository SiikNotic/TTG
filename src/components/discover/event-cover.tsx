import { getCategoryMeta, type EventCategory } from "@/data/events";
import { cn } from "@/lib/utils";

interface EventCoverProps {
  category: EventCategory;
  className?: string;
  iconClassName?: string;
}

/**
 * Portada del evento generada con gradientes CSS a partir de los tokens
 * de marca (sin peso de red ni imágenes que optimizar). Evita el riesgo
 * de mostrar fotografía que parezca real de un evento que no existe.
 */
function EventCover({ category, className, iconClassName }: EventCoverProps) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, var(${meta.gradient[0]}), var(${meta.gradient[1]}))`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
        }}
      />
      <Icon className={cn("relative text-white/85", iconClassName ?? "size-8")} strokeWidth={1.5} />
    </div>
  );
}

export { EventCover };
