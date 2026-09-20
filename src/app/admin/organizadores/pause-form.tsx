"use client";

import { useActionState, useState } from "react";
import { adminPauseOrganizerEvents } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";

function PauseOrganizerForm({ organizerId }: { organizerId: string }) {
  const [state, formAction] = useActionState(adminPauseOrganizerEvents, INITIAL_ACTION_STATE);
  const [confirming, setConfirming] = useState(false);

  if (state.success) {
    return <span className="text-xs text-success-600">{state.success}</span>;
  }

  if (!confirming) {
    return (
      <Button type="button" size="sm" variant="destructive" onClick={() => setConfirming(true)}>
        Pausar todos sus eventos
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="organizerId" value={organizerId} />
      <span className="text-xs text-muted-foreground">¿Pausar todos los eventos publicados?</span>
      <SubmitButton size="sm" variant="destructive">
        Sí, pausar
      </SubmitButton>
      <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        No
      </Button>
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { PauseOrganizerForm };
