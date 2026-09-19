"use client";

import { useActionState, useState } from "react";
import { refundTicket, cancelTicket } from "@/lib/actions/tickets";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { TicketInventory, TicketRow } from "@/lib/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  active: { label: "Activa", variant: "success" },
  used: { label: "Usada", variant: "neutral" },
  cancelled: { label: "Cancelada", variant: "danger" },
  refunded: { label: "Reembolsada", variant: "danger" },
  expired: { label: "Expirada", variant: "warning" },
};

function InventoryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function TicketRowActions({ ticket }: { ticket: TicketRow }) {
  const [refundState, refundAction] = useActionState(refundTicket, INITIAL_ACTION_STATE);
  const [cancelState, cancelAction] = useActionState(cancelTicket, INITIAL_ACTION_STATE);
  const [mode, setMode] = useState<"idle" | "refund" | "cancel">("idle");

  if (ticket.status !== "active") return null;

  if (mode === "refund") {
    return (
      <form action={refundAction} className="flex items-center gap-2">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <span className="text-xs text-muted-foreground">¿Reembolsar?</span>
        <SubmitButton size="sm" variant="destructive">
          Sí
        </SubmitButton>
        <Button type="button" size="sm" variant="ghost" onClick={() => setMode("idle")}>
          No
        </Button>
        {refundState.error && <span className="text-xs text-destructive">{refundState.error}</span>}
      </form>
    );
  }

  if (mode === "cancel") {
    return (
      <form action={cancelAction} className="flex items-center gap-2">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <span className="text-xs text-muted-foreground">¿Cancelar?</span>
        <SubmitButton size="sm" variant="destructive">
          Sí
        </SubmitButton>
        <Button type="button" size="sm" variant="ghost" onClick={() => setMode("idle")}>
          No
        </Button>
        {cancelState.error && <span className="text-xs text-destructive">{cancelState.error}</span>}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button type="button" size="sm" variant="outline" onClick={() => setMode("refund")}>
        Reembolsar
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setMode("cancel")}>
        Cancelar
      </Button>
    </div>
  );
}

function TicketInventoryPanel({ inventory, tickets }: { inventory: TicketInventory; tickets: TicketRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <InventoryStat label="Capacidad" value={inventory.capacityTotal} />
        <InventoryStat label="Activas" value={inventory.active} />
        <InventoryStat label="Usadas" value={inventory.used} />
        <InventoryStat label="Canceladas" value={inventory.cancelled} />
        <InventoryStat label="Reembolsadas" value={inventory.refunded} />
        <InventoryStat label="Disponibles" value={inventory.available} />
      </div>

      {tickets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {tickets.map((ticket) => {
            const status = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.active!;
            return (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{ticket.serial}</span>
                </div>
                <TicketRowActions ticket={ticket} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { TicketInventoryPanel };
