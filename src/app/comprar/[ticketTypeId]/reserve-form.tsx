"use client";

import { useActionState, useState } from "react";
import { reserveTickets } from "@/lib/actions/orders";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ReserveForm({ ticketTypeId, maxSelectable }: { ticketTypeId: string; maxSelectable: number }) {
  const [state, formAction] = useActionState(reserveTickets, INITIAL_ACTION_STATE);
  const [quantity, setQuantity] = useState("1");

  if (maxSelectable <= 0) {
    return <p className="text-sm text-muted-foreground">No quedan entradas disponibles por ahora.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="ticketTypeId" value={ticketTypeId} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="grid gap-1.5 sm:w-40">
        <Label htmlFor="quantity">Cantidad</Label>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger id="quantity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SubmitButton className="w-fit">Reservar</SubmitButton>
      <p className="text-xs text-muted-foreground">
        La reserva se mantiene por 10 minutos. Si no confirmas, el cupo se libera automáticamente.
      </p>
    </form>
  );
}

export { ReserveForm };
