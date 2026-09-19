"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
        <FieldHelp>Mínimo 8 caracteres.</FieldHelp>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirma la nueva contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
      </div>

      <SubmitButton className="w-fit" size="sm">
        Actualizar contraseña
      </SubmitButton>
    </form>
  );
}

export { ChangePasswordForm };
