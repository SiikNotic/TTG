"use client";

import { useActionState, useEffect } from "react";
import { createTicketType, updateTicketType } from "@/lib/actions/ticket-types";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { TicketTypeRow } from "@/lib/organizer";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

interface TicketTypeFormProps {
  eventId: string;
  ticket: TicketTypeRow | null;
  onSuccess: () => void;
}

function TicketTypeForm({ eventId, ticket, onSuccess }: TicketTypeFormProps) {
  const action = ticket ? updateTicketType : createTicketType;
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="eventId" value={eventId} />
      {ticket && <input type="hidden" name="ticketTypeId" value={ticket.id} />}

      <div className="grid gap-1.5">
        <Label htmlFor="tt-name">Nombre</Label>
        <Input id="tt-name" name="name" placeholder="General, VIP, Early bird…" defaultValue={ticket?.name} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="tt-price">Precio (0 = gratis)</Label>
          <Input id="tt-price" name="price" type="number" min={0} step="0.01" defaultValue={ticket?.price ?? 0} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="tt-quantity">Cantidad disponible</Label>
          <Input
            id="tt-quantity"
            name="quantityTotal"
            type="number"
            min={1}
            defaultValue={ticket?.quantity_total}
            required
          />
        </div>
      </div>

      <div className="grid gap-1.5 sm:w-56">
        <Label htmlFor="tt-max">Máximo por comprador</Label>
        <Input id="tt-max" name="maxPerBuyer" type="number" min={1} max={50} defaultValue={ticket?.max_per_buyer ?? 4} required />
        <FieldHelp>Por defecto 4. Se valida también en el servidor, no solo aquí.</FieldHelp>
      </div>

      <SubmitButton className="w-fit">{ticket ? "Guardar cambios" : "Crear tipo de entrada"}</SubmitButton>
    </form>
  );
}

export { TicketTypeForm };
