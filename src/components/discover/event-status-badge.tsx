import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/data/events";

const statusConfig: Record<EventStatus, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  disponible: { label: "Disponible", variant: "success" },
  agotado: { label: "Agotado", variant: "warning" },
  cancelado: { label: "Cancelado", variant: "danger" },
  finalizado: { label: "Finalizado", variant: "neutral" },
};

function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { EventStatusBadge, statusConfig };
