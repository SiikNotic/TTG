"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, INITIAL_ACTION_STATE);

  if (state.success) {
    return <FormAlert state={state} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <SubmitButton>Enviar enlace de recuperación</SubmitButton>
    </form>
  );
}

export { ForgotPasswordForm };
