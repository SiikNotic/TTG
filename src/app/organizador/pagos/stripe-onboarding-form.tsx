"use client";

import { useActionState, useState } from "react";
import { startStripeOnboarding } from "@/lib/actions/payments";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

const COUNTRIES = [
  { code: "CO", label: "Colombia" },
  { code: "MX", label: "México" },
  { code: "US", label: "Estados Unidos" },
  { code: "ES", label: "España" },
  { code: "AR", label: "Argentina" },
  { code: "CL", label: "Chile" },
  { code: "PE", label: "Perú" },
  { code: "BR", label: "Brasil" },
  { code: "CA", label: "Canadá" },
];

/** Primera vez: hay que elegir el país de la cuenta Stripe (no se puede cambiar después). */
function StripeOnboardingStartForm() {
  const [state, formAction] = useActionState(startStripeOnboarding, INITIAL_ACTION_STATE);
  const [country, setCountry] = useState("CO");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="country" value={country} />
      <div className="grid gap-1.5 sm:w-56">
        <Label htmlFor="country">País de tu cuenta de cobro</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger id="country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          No se puede cambiar después de crear la cuenta. Si Stripe no admite cuentas conectadas en tu país,
          verás un error de Stripe al continuar.
        </p>
      </div>
      <SubmitButton className="w-fit">Conectar con Stripe</SubmitButton>
    </form>
  );
}

/** Onboarding ya empezado (cuenta creada) pero incompleto: solo continuar, sin volver a pedir país. */
function StripeOnboardingContinueForm() {
  const [state, formAction] = useActionState(startStripeOnboarding, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <SubmitButton className="w-fit">Continuar configuración en Stripe</SubmitButton>
    </form>
  );
}

export { StripeOnboardingStartForm, StripeOnboardingContinueForm };
