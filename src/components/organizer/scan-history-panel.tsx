"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, History } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { formatDateShortInTimeZone, formatTimeInTimeZone } from "@/lib/timezone";
import type { ScanHistoryEntry } from "@/lib/organizer";

const RESULT_INFO: Record<string, { label: string; variant: BadgeProps["variant"]; icon: typeof CheckCircle2 }> = {
  VALIDO: { label: "Válido", variant: "success", icon: CheckCircle2 },
  YA_UTILIZADO: { label: "Ya utilizado", variant: "warning", icon: AlertTriangle },
  CANCELADO: { label: "Cancelado", variant: "danger", icon: XCircle },
  REEMBOLSADO: { label: "Reembolsado", variant: "danger", icon: XCircle },
  EXPIRADO: { label: "Expirado", variant: "warning", icon: AlertTriangle },
  INVALIDO: { label: "Inválido", variant: "danger", icon: ShieldAlert },
  EVENTO_INCORRECTO: { label: "Evento incorrecto", variant: "danger", icon: ShieldAlert },
};

type FilterValue = "todos" | "validos" | "fallidos";

function ScanHistoryRow({ entry, timezone }: { entry: ScanHistoryEntry; timezone: string }) {
  const info = RESULT_INFO[entry.result] ?? { label: entry.result, variant: "neutral" as const, icon: ShieldAlert };
  const when = `${formatDateShortInTimeZone(entry.createdAt, timezone)} · ${formatTimeInTimeZone(entry.createdAt, timezone)}`;

  return (
    <div className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
      <info.icon
        className={`mt-0.5 size-4 shrink-0 ${
          info.variant === "success" ? "text-success-600" : info.variant === "warning" ? "text-warning-600" : "text-danger-600"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={info.variant}>{info.label}</Badge>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {entry.serial ?? "Token no asociado"}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {entry.scannedByName ?? "Miembro del staff"} · {when}
        </p>
      </div>
    </div>
  );
}

function ScanHistoryPanel({
  entries,
  hasMore,
  timezone,
}: {
  entries: ScanHistoryEntry[];
  hasMore: boolean;
  timezone: string;
}) {
  const [filter, setFilter] = useState<FilterValue>("todos");

  const filtered = useMemo(() => {
    if (filter === "validos") return entries.filter((e) => e.result === "VALIDO");
    if (filter === "fallidos") return entries.filter((e) => e.result !== "VALIDO");
    return entries;
  }, [entries, filter]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<History className="size-5" />}
        title="Este evento todavía no tiene escaneos."
        description="Cuando el staff empiece a validar entradas en la puerta, el historial aparece acá."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="validos">Válidos</TabsTrigger>
          <TabsTrigger value="fallidos">Fallidos</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay escaneos en esta categoría.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map((entry) => (
                <ScanHistoryRow key={entry.id} entry={entry} timezone={timezone} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {hasMore && (
        <p className="text-center text-xs text-muted-foreground">
          Mostrando los últimos 50 escaneos. Hay más registros anteriores.
        </p>
      )}
    </div>
  );
}

export { ScanHistoryPanel };
