"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { enrollMfa, verifyMfaEnrollment, unenrollMfa, type MfaEnrollResult } from "@/lib/actions/mfa";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

interface ExistingFactor {
  id: string;
  friendlyName: string | null;
}

function MfaSection({ factor }: { factor: ExistingFactor | null }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<MfaEnrollResult | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [verifyState, verifyAction] = useActionState(verifyMfaEnrollment, INITIAL_ACTION_STATE);
  const [unenrollState, unenrollAction] = useActionState(unenrollMfa, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (verifyState.success) {
      setEnrollment(null);
      router.refresh();
    }
  }, [verifyState.success, router]);

  useEffect(() => {
    if (unenrollState.success) {
      router.refresh();
    }
  }, [unenrollState.success, router]);

  async function handleStartEnrollment() {
    setStarting(true);
    setEnrollError(null);
    const result = await enrollMfa();
    setStarting(false);
    if (result.error) {
      setEnrollError(result.error);
      return;
    }
    setEnrollment(result);
  }

  if (factor) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-success-500" />
          <Badge variant="success">Activada</Badge>
          <span className="text-sm text-muted-foreground">{factor.friendlyName ?? "Autenticador"}</span>
        </div>
        <FormAlert state={unenrollState} />
        <form action={unenrollAction} className="w-fit">
          <input type="hidden" name="factorId" value={factor.id} />
          <SubmitButton variant="outline" size="sm" className="w-fit">
            Desactivar
          </SubmitButton>
        </form>
      </div>
    );
  }

  if (enrollment?.qrCode) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Escanea este código con tu app autenticadora (Google Authenticator, 1Password, etc.) y
          escribe el código de 6 dígitos que genere.
        </p>
        <div
          className="w-fit rounded-md border border-border bg-white p-2"
          // El SVG viene directamente de la respuesta de Supabase Auth, no de
          // input de usuario.
          dangerouslySetInnerHTML={{ __html: enrollment.qrCode }}
        />
        {enrollment.secret && (
          <p className="text-xs text-muted-foreground">
            O ingresa esta clave manualmente:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">{enrollment.secret}</code>
          </p>
        )}

        <form action={verifyAction} className="flex flex-col gap-3">
          <FormAlert state={verifyState} />
          <input type="hidden" name="factorId" value={enrollment.factorId} />
          <div className="grid gap-1.5">
            <Label htmlFor="code">Código de verificación</Label>
            <Input id="code" name="code" inputMode="numeric" maxLength={6} placeholder="000000" required />
          </div>
          <div className="flex gap-2">
            <SubmitButton className="w-fit" size="sm">
              Confirmar
            </SubmitButton>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEnrollment(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Añade una capa extra de seguridad requiriendo un código de tu app autenticadora al
        acceder al panel de administración.
      </p>
      {enrollError && (
        <p role="alert" className="text-sm text-destructive">
          {enrollError}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        loading={starting}
        onClick={handleStartEnrollment}
      >
        Activar verificación en dos pasos
      </Button>
    </div>
  );
}

export { MfaSection };
