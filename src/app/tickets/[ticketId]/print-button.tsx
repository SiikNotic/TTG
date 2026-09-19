"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function PrintButton() {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()} className="print:hidden">
      <Download className="size-4" /> Descargar / Imprimir PDF
    </Button>
  );
}

export { PrintButton };
