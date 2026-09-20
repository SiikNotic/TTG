"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";

function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={8} required showStrength />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirma la nueva contraseña</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={8} required />
      </div>

      <SubmitButton className="w-fit" size="sm">
        Actualizar contraseña
      </SubmitButton>
    </form>
  );
}

export { ChangePasswordForm };
