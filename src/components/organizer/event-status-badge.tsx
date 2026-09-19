import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/database.types";

type EventStatus = Database["public"]["Enums"]["event_status"];

const STATUS_CONFIG: Record<EventStatus, { label: string; variant: "neutral" | "success" | "warning" | "danger" }> = {
  borrador: { label: "Borrador", variant: "neutral" },
  publicado: { label: "Publicado", variant: "success" },
  pausado: { label: "Ventas pausadas", variant: "warning" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

function EventStatusBadge({ status, isPast }: { status: EventStatus; isPast?: boolean }) {
  if (isPast && status !== "cancelado") {
    return <Badge variant="neutral">Finalizado</Badge>;
  }
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { EventStatusBadge };
