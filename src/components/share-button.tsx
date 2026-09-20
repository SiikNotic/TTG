"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // El usuario cerró el panel de compartir: no es un error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace copiado", description: "Pégalo donde quieras compartirlo.", variant: "success" });
    } catch {
      toast({ title: "No se pudo copiar el enlace", variant: "error" });
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleShare} className="print:hidden">
      <Share2 className="size-4" /> Compartir
    </Button>
  );
}

export { ShareButton };
