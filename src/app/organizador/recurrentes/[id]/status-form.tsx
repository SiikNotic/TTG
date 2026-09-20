"use client";

import { useActionState } from "react";
import { setVenueSeriesStatus } from "@/lib/actions/venue-series";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

function VenueSeriesStatusForm({ seriesId, status }: { seriesId: string; status: string }) {
  const [state, formAction] = useActionState(setVenueSeriesStatus, INITIAL_ACTION_STATE);
  const nextStatus = status === "activa" ? "pausada" : "activa";

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <FormAlert state={state} />
      <input type="hidden" name="seriesId" value={seriesId} />
      <input type="hidden" name="status" value={nextStatus} />
      <SubmitButton size="sm" variant={status === "activa" ? "outline" : "primary"} className="w-fit">
        {status === "activa" ? "Pausar negocio" : "Reactivar negocio"}
      </SubmitButton>
    </form>
  );
}

export { VenueSeriesStatusForm };
