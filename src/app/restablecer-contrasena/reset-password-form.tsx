"use client";

import { useActionState } from "react";
import { setNewPasswordAfterRecovery } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ResetPasswordForm() {
  const [state, formAction] = useActionState(setNewPasswordAfterRecovery, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <FieldHelp>Mínimo 8 caracteres.</FieldHelp>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirma la contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
      </div>

      <SubmitButton>Guardar nueva contraseña</SubmitButton>
    </form>
  );
}

export { ResetPasswordForm };
