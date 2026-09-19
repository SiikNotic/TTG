"use client";

import { useActionState } from "react";
import { confirmOrderAction, cancelOrderAction } from "@/lib/actions/orders";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";

function ConfirmOrderForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(confirmOrderAction, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton>Confirmar pago (simulado)</SubmitButton>
      <p className="text-xs text-muted-foreground">
        No se procesa ningún pago real todavía: esto emite las entradas directamente para poder probar el
        sistema de tickets.
      </p>
    </form>
  );
}

function CancelOrderForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(cancelOrderAction, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <FormAlert state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit" variant="ghost" size="sm" className="w-fit">
        Cancelar reserva
      </Button>
    </form>
  );
}

export { ConfirmOrderForm, CancelOrderForm };
