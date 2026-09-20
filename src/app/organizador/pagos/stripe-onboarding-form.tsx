"use client";

import { useActionState, useState } from "react";
import { startStripeOnboarding } from "@/lib/actions/payments";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

// Stripe no tiene un código de país propio para Puerto Rico: lo trata como
// territorio de Estados Unidos, así que un organizador en Puerto Rico
// también elige "Estados Unidos" acá (se lo aclaramos abajo). La lista
// completa de países disponibles depende de qué países estén habilitados
// para onboarding cross-border en la cuenta de Stripe de la plataforma
// (dashboard.stripe.com/account/applications/settings); por ahora solo
// Estados Unidos está habilitado.
const COUNTRIES = [{ code: "US", label: "Estados Unidos" }];

/** Primera vez: hay que elegir el país de la cuenta Stripe (no se puede cambiar después). */
function StripeOnboardingStartForm() {
  const [state, formAction] = useActionState(startStripeOnboarding, INITIAL_ACTION_STATE);
  const [country, setCountry] = useState("US");

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
          No se puede cambiar después de crear la cuenta. Si tu negocio está en Puerto Rico, selecciona igual
          Estados Unidos: Stripe no tiene un código de país separado para Puerto Rico.
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
