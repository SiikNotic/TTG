"use client";

import { useActionState } from "react";
import {
  triggerPaypalPayout,
  markAthMovilPayoutComplete,
  refreshPaypalPayoutStatus,
} from "@/lib/actions/admin-payouts";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function TriggerPaypalPayoutForm({ organizerId }: { organizerId: string }) {
  const [state, formAction] = useActionState(triggerPaypalPayout, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <FormAlert state={state} />
      <input type="hidden" name="organizerId" value={organizerId} />
      <SubmitButton size="sm" className="w-fit">
        Enviar a PayPal
      </SubmitButton>
    </form>
  );
}

function MarkAthMovilPaidForm({ organizerId, pendingBalance }: { organizerId: string; pendingBalance: number }) {
  const [state, formAction] = useActionState(markAthMovilPayoutComplete, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <FormAlert state={state} />
      <input type="hidden" name="organizerId" value={organizerId} />
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label htmlFor={`amount-${organizerId}`} className="text-xs">
            Monto (USD)
          </Label>
          <Input
            id={`amount-${organizerId}`}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={(pendingBalance / 100).toFixed(2)}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`reference-${organizerId}`} className="text-xs">
            Referencia / confirmación
          </Label>
          <Input id={`reference-${organizerId}`} name="reference" required />
        </div>
      </div>
      <SubmitButton size="sm" className="w-fit">
        Marcar como pagado
      </SubmitButton>
    </form>
  );
}

function RefreshPaypalStatusForm({ payoutId }: { payoutId: string }) {
  const [state, formAction] = useActionState(refreshPaypalPayoutStatus, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <FormAlert state={state} />
      <input type="hidden" name="payoutId" value={payoutId} />
      <SubmitButton size="sm" variant="outline">
        Verificar en PayPal
      </SubmitButton>
    </form>
  );
}

export { TriggerPaypalPayoutForm, MarkAthMovilPaidForm, RefreshPaypalStatusForm };
