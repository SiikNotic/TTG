"use client";

import { useActionState, useState } from "react";
import { adminSetEventStatus } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";

const STATUSES = [
  { value: "borrador", label: "Borrador" },
  { value: "publicado", label: "Publicado" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
];

function EventStatusForm({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
  const [state, formAction] = useActionState(adminSetEventStatus, INITIAL_ACTION_STATE);
  const [status, setStatus] = useState(currentStatus);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="newStatus" value={status} />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-8 w-32 text-xs">
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
      {status !== currentStatus && (
        <SubmitButton size="sm" variant="outline">
          Guardar
        </SubmitButton>
      )}
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { EventStatusForm };
