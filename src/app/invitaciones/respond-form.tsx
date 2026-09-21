"use client";

import { useActionState } from "react";
import { respondStaffInvitation } from "@/lib/actions/staff";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { SubmitButton } from "@/components/auth/submit-button";

function RespondInvitationForm({ invitationId }: { invitationId: string }) {
  const [state, formAction] = useActionState(respondStaffInvitation, INITIAL_ACTION_STATE);

  if (state.success) {
    return <span className="text-xs text-muted-foreground">{state.success}</span>;
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="invitationId" value={invitationId} />
      <div className="flex gap-2">
        <SubmitButton name="accept" value="false" size="sm" variant="outline" className="w-fit">
          Rechazar
        </SubmitButton>
        <SubmitButton name="accept" value="true" size="sm" className="w-fit">
          Aceptar
        </SubmitButton>
      </div>
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { RespondInvitationForm };
