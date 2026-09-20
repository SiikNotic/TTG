"use client";

import { useActionState, useState } from "react";
import { updatePayoutSettings } from "@/lib/actions/payouts";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

const METHODS = [
  {
    value: "stripe",
    label: "Banco (vía Stripe)",
    description: "Automático: Stripe te paga directo a tu cuenta bancaria.",
  },
  { value: "paypal", label: "PayPal", description: "Automático: te pagamos a tu cuenta de PayPal." },
  {
    value: "ath_movil",
    label: "ATH Móvil",
    description: "Manual: un administrador te transfiere y confirma el pago.",
  },
] as const;

interface PayoutMethodFormProps {
  currentMethod: string;
  paypalEmail: string | null;
  athMovilPhone: string | null;
}

function PayoutMethodForm({ currentMethod, paypalEmail, athMovilPhone }: PayoutMethodFormProps) {
  const [state, formAction] = useActionState(updatePayoutSettings, INITIAL_ACTION_STATE);
  const [method, setMethod] = useState(currentMethod);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-foreground">Método de cobro</legend>
        {METHODS.map((m) => (
          <label
            key={m.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border border-border-strong p-3",
              "has-[:checked]:border-primary has-[:checked]:bg-accent",
              "transition-colors duration-fast ease-standard"
            )}
          >
            <input
              type="radio"
              name="method"
              value={m.value}
              checked={method === m.value}
              onChange={() => setMethod(m.value)}
              className="mt-1 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{m.label}</span>
              <span className="block text-xs text-muted-foreground">{m.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === "paypal" && (
        <div className="grid gap-1.5">
          <Label htmlFor="paypalEmail">Correo de PayPal</Label>
          <Input
            id="paypalEmail"
            name="paypalEmail"
            type="email"
            defaultValue={paypalEmail ?? ""}
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>
      )}

      {method === "ath_movil" && (
        <div className="grid gap-1.5">
          <Label htmlFor="athMovilPhone">Número de ATH Móvil</Label>
          <Input
            id="athMovilPhone"
            name="athMovilPhone"
            type="tel"
            defaultValue={athMovilPhone ?? ""}
            placeholder="787-555-1234"
            required
          />
        </div>
      )}

      <SubmitButton className="w-fit">Guardar método de cobro</SubmitButton>
    </form>
  );
}

export { PayoutMethodForm };
