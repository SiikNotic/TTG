"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ProfileForm({ fullName }: { fullName: string | null }) {
  const [state, formAction] = useActionState(updateProfile, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName ?? ""} required />
      </div>
      <SubmitButton className="w-fit" size="sm">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}

export { ProfileForm };
