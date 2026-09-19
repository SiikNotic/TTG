"use client";

import { useActionState } from "react";
import { updateOrganizerProfile } from "@/lib/actions/organizer-profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

interface Props {
  displayName: string;
  bio: string;
  websiteUrl: string;
}

function OrganizerProfileForm({ displayName, bio, websiteUrl }: Props) {
  const [state, formAction] = useActionState(updateOrganizerProfile, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="displayName">Nombre público</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required maxLength={80} />
        <FieldHelp>Así te verán los asistentes en tus eventos.</FieldHelp>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={bio} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="websiteUrl">Sitio web</Label>
        <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" defaultValue={websiteUrl} />
      </div>

      <SubmitButton className="w-fit">Guardar cambios</SubmitButton>
    </form>
  );
}

export { OrganizerProfileForm };
