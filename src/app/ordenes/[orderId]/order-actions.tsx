"use client";

import { useActionState } from "react";
import { CreditCard, Ticket } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/payments";
import { cancelOrderAction, confirmFreeOrder } from "@/lib/actions/orders";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";

function ConfirmOrderForm({ orderId, isFree }: { orderId: string; isFree: boolean }) {
  const [state, formAction] = useActionState(isFree ? confirmFreeOrder : createCheckoutSession, INITIAL_ACTION_STATE);

  if (isFree) {
    return (
      <form action={formAction} className="flex flex-col gap-3">
        <FormAlert state={state} />
        <input type="hidden" name="orderId" value={orderId} />
        <SubmitButton>
          <Ticket className="size-4" /> Confirmar entrada gratis
        </SubmitButton>
      </form>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton>
        <CreditCard className="size-4" /> Pagar con Stripe
      </SubmitButton>
      <p className="text-xs text-muted-foreground">
        Se abre el checkout seguro de Stripe. Las entradas se emiten solo cuando Stripe confirma el pago; nunca
        guardamos el número de tu tarjeta.
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
