"use client";

import { useActionState, useState } from "react";
import {
  publishEvent,
  pauseEventSales,
  resumeEventSales,
  cancelEvent,
  deleteDraftEvent,
} from "@/lib/actions/events";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalTrigger,
  ModalClose,
} from "@/components/ui/modal";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import type { Database } from "@/lib/supabase/database.types";

type EventStatus = Database["public"]["Enums"]["event_status"];

function SimpleActionForm({
  eventId,
  action,
  label,
  variant = "primary",
}: {
  eventId: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  variant?: "primary" | "secondary" | "outline";
}) {
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <SubmitButton variant={variant} className="w-fit">
        {label}
      </SubmitButton>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}

function DestructiveActionModal({
  eventId,
  action,
  triggerLabel,
  title,
  description,
  confirmLabel,
}: {
  eventId: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button type="button" variant="outline" className="w-fit">
          {triggerLabel}
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <FormAlert state={state} />
        <form action={formAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <ModalFooter>
            <ModalClose asChild>
              <Button type="button" variant="ghost">
                Volver
              </Button>
            </ModalClose>
            <SubmitButton variant="destructive" className="w-fit">
              {confirmLabel}
            </SubmitButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function EventStatusActions({ eventId, status }: { eventId: string; status: EventStatus }) {
  if (status === "cancelado") {
    return <p className="text-sm text-muted-foreground">Este evento está cancelado.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "borrador" && (
        <>
          <SimpleActionForm eventId={eventId} action={publishEvent} label="Publicar evento" />
          <DestructiveActionModal
            eventId={eventId}
            action={deleteDraftEvent}
            triggerLabel="Eliminar borrador"
            title="Eliminar borrador"
            description="Esta acción no se puede deshacer. El evento y sus tipos de entrada se eliminarán."
            confirmLabel="Eliminar borrador"
          />
        </>
      )}

      {status === "publicado" && (
        <SimpleActionForm eventId={eventId} action={pauseEventSales} label="Pausar ventas" variant="outline" />
      )}

      {status === "pausado" && (
        <SimpleActionForm eventId={eventId} action={resumeEventSales} label="Reanudar ventas" />
      )}

      {(status === "publicado" || status === "pausado") && (
        <DestructiveActionModal
          eventId={eventId}
          action={cancelEvent}
          triggerLabel="Cancelar evento"
          title="Cancelar evento"
          description="Esta acción es permanente: el evento dejará de mostrarse como disponible para compra."
          confirmLabel="Cancelar evento"
        />
      )}
    </div>
  );
}

export { EventStatusActions };
