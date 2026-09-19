"use client";

import { useActionState, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import { uploadOrganizerLogo } from "@/lib/actions/organizer-profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";

function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction] = useActionState(uploadOrganizerLogo, INITIAL_ACTION_STATE);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? logoUrl;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormAlert state={state} />
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- viene de Supabase Storage.
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-6" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            name="logo"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Elegir imagen
          </Button>
          <p className="text-xs text-muted-foreground">JPG o PNG, máx. 2 MB.</p>
        </div>
      </div>
      <SubmitButton size="sm" className="w-fit">
        Guardar logo
      </SubmitButton>
    </form>
  );
}

export { LogoForm };
