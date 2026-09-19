"use client";

import { useActionState } from "react";
import { resendVerificationEmail } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function ResendForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(resendVerificationEmail, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="email" value={email} />
      <SubmitButton variant="outline">Reenviar correo</SubmitButton>
    </form>
  );
}

export { ResendForm };
