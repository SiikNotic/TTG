"use client";

import { useActionState } from "react";
import { challengeMfa } from "@/lib/actions/mfa";
import type { ActionState } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

const INITIAL_STATE: ActionState = {};

function ChallengeForm({ factorId, next }: { factorId: string; next: string }) {
  const [state, formAction] = useActionState(challengeMfa, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="factorId" value={factorId} />
      <input type="hidden" name="next" value={next} />

      <div className="grid gap-1.5">
        <Label htmlFor="code">Código de verificación</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          required
        />
      </div>

      <SubmitButton>Verificar</SubmitButton>
    </form>
  );
}

export { ChallengeForm };
