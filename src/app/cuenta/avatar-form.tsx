"use client";

import { useActionState, useRef, useState } from "react";
import { User } from "lucide-react";
import { uploadAvatar } from "@/lib/actions/profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";

function AvatarForm({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  const [state, formAction] = useActionState(uploadAvatar, INITIAL_ACTION_STATE);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  const displayUrl = preview ?? avatarUrl;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage, tamaño variable.
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : initials ? (
            <span className="text-lg font-semibold">{initials}</span>
          ) : (
            <User className="size-6" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-input"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Elegir imagen
          </Button>
          <p className="text-xs text-muted-foreground">JPG o PNG, máx. 2 MB.</p>
        </div>
      </div>
      <SubmitButton size="sm" className="w-fit">
        Guardar foto
      </SubmitButton>
    </form>
  );
}

export { AvatarForm };
