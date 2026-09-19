"use client";

import { Share2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { EventStatus } from "@/data/events";

interface EventActionsProps {
  slug: string;
  title: string;
  status: EventStatus;
}

const buyButtonConfig: Record<
  EventStatus,
  { label: string; disabled: boolean; variant: "primary" | "secondary" | "outline" }
> = {
  disponible: { label: "Comprar entradas", disabled: false, variant: "primary" },
  agotado: { label: "Agotado", disabled: true, variant: "secondary" },
  cancelado: { label: "Evento cancelado", disabled: true, variant: "outline" },
  finalizado: { label: "Evento finalizado", disabled: true, variant: "secondary" },
};

function EventActions({ slug, title, status }: EventActionsProps) {
  const { toast } = useToast();
  const buyConfig = buyButtonConfig[status];

  async function handleShare() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/eventos/${slug}` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Usuario canceló el share nativo; no requiere manejo adicional.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace copiado", description: url, variant: "success" });
    } catch {
      toast({ title: "No se pudo copiar el enlace", variant: "error" });
    }
  }

  function handleBuy() {
    toast({
      title: "Compra de entradas próximamente",
      description: "Esta funcionalidad aún no está disponible en la demo.",
      variant: "info",
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant={buyConfig.variant}
        disabled={buyConfig.disabled}
        onClick={buyConfig.disabled ? undefined : handleBuy}
        className="flex-1"
      >
        <Ticket />
        {buyConfig.label}
      </Button>
      <Button size="lg" variant="outline" onClick={handleShare} aria-label="Compartir evento">
        <Share2 />
      </Button>
    </div>
  );
}

export { EventActions };
