"use client";

import { useActionState } from "react";
import { inviteStaff } from "@/lib/actions/staff";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

const BUSINESS_WIDE = "__negocio__";

function InviteStaffForm({ events }: { events: { id: string; title: string }[] }) {
  const [state, formAction] = useActionState(inviteStaff, INITIAL_ACTION_STATE);

  return (
    <form
      action={(formData) => {
        const eventId = formData.get("eventId");
        if (eventId === BUSINESS_WIDE) formData.set("eventId", "");
        return formAction(formData);
      }}
      className="flex flex-col gap-4"
    >
      <FormAlert state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="email">Correo de la persona</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="staff@ejemplo.com"
          required
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">Debe tener ya una cuenta en TTG.</p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="eventId">Alcance</Label>
        <Select name="eventId" defaultValue={BUSINESS_WIDE}>
          <SelectTrigger id="eventId">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BUSINESS_WIDE}>Todo el negocio (todos mis eventos)</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                Solo: {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SubmitButton className="w-fit">Enviar invitación</SubmitButton>
    </form>
  );
}

export { InviteStaffForm };
