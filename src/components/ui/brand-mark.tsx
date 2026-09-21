import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ícono de marca, siempre el mismo en toda la app (antes variaba de página en página). */
function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className
      )}
    >
      <Ticket className="size-4" />
    </span>
  );
}

export { BrandMark };
