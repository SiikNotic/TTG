"use client";

import { useActionState, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { uploadEventCover } from "@/lib/actions/events";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import type { EventCategory } from "@/lib/categories";
import { EventCover } from "@/components/discover/event-cover";

function EventCoverForm({
  eventId,
  coverUrl,
  category,
}: {
  eventId: string;
  coverUrl: string | null;
  category: EventCategory;
}) {
  const [state, formAction] = useActionState(uploadEventCover, INITIAL_ACTION_STATE);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? coverUrl;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="eventId" value={eventId} />
      <div className="overflow-hidden rounded-lg border border-border">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- viene de Supabase Storage.
          <img src={displayUrl} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <EventCover category={category} className="aspect-video w-full" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name="cover"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageIcon className="size-4" /> Elegir imagen
        </Button>
        <SubmitButton size="sm" className="w-fit">
          Guardar
        </SubmitButton>
      </div>
    </form>
  );
}

export { EventCoverForm };
