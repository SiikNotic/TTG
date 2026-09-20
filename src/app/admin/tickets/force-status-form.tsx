"use client";

import { useActionState, useState } from "react";
import { adminForceTicketStatus } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";

const STATUSES = [
  { value: "active", label: "Activo" },
  { value: "used", label: "Usado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
  { value: "disputed", label: "En disputa" },
];

function ForceStatusForm({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const [state, formAction] = useActionState(adminForceTicketStatus, INITIAL_ACTION_STATE);
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);

  if (state.success) {
    return <span className="text-xs text-success-600">{state.success}</span>;
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Forzar estado
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <Select value={newStatus} onValueChange={setNewStatus}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="newStatus" value={newStatus} />
      <Input name="reason" placeholder="Motivo (obligatorio)" required className="h-8 w-48 text-xs" />
      <SubmitButton size="sm" variant="destructive">
        Confirmar
      </SubmitButton>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      {state.error && <span className="w-full text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { ForceStatusForm };
