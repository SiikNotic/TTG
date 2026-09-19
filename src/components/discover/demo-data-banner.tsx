import { Info } from "lucide-react";

function DemoDataBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md bg-info-500/10 px-3 py-2 text-xs text-info-700">
      <Info className="size-3.5 shrink-0" />
      <span>
        Estás viendo un catálogo de demostración: eventos, organizadores y precios son ficticios.
      </span>
    </div>
  );
}

export { DemoDataBanner };
