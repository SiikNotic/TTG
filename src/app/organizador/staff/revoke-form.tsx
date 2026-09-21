"use client";

import { useActionState } from "react";
import { revokeStaffInvite } from "@/lib/actions/staff";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { SubmitButton } from "@/components/auth/submit-button";

function RevokeStaffForm({ invitationId, label }: { invitationId: string; label: string }) {
  const [state, formAction] = useActionState(revokeStaffInvite, INITIAL_ACTION_STATE);

  if (state.success) {
    return <span className="text-xs text-muted-foreground">{state.success}</span>;
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <SubmitButton size="sm" variant="outline" className="w-fit">
        {label}
      </SubmitButton>
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { RevokeStaffForm };
