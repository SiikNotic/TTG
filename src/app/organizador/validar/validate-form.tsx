"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, XCircle, ScanLine } from "lucide-react";
import { checkTicketToken, markTicketUsed } from "@/lib/actions/tickets";
import { INITIAL_TICKET_CHECK_STATE } from "@/lib/actions/ticket-check-state";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/auth/submit-button";

const STATUS_INFO: Record<string, { label: string; ok: boolean }> = {
  active: { label: "Válida — permitir ingreso", ok: true },
  used: { label: "Ya fue utilizada", ok: false },
  cancelled: { label: "Cancelada", ok: false },
  refunded: { label: "Reembolsada", ok: false },
  expired: { label: "Expirada", ok: false },
};

function ValidateForm() {
  const [checkState, checkAction] = useActionState(checkTicketToken, INITIAL_TICKET_CHECK_STATE);
  const [useState_, markUsedAction] = useActionState(markTicketUsed, INITIAL_ACTION_STATE);
  const [tokenInput, setTokenInput] = useState("");
  const [justUsed, setJustUsed] = useState(false);

  useEffect(() => {
    if (useState_.success) {
      setTokenInput("");
      setJustUsed(true);
    }
  }, [useState_.success]);

  useEffect(() => {
    setJustUsed(false);
  }, [checkState.ticket]);

  const ticket = checkState.ticket;
  const effectiveStatus = justUsed && ticket?.status === "active" ? "used" : ticket?.status;
  const info = effectiveStatus ? STATUS_INFO[effectiveStatus] : null;

  return (
    <div className="flex flex-col gap-6">
      <form action={checkAction} className="flex flex-col gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="token">Código del ticket</Label>
          <Input
            id="token"
            name="token"
            placeholder="Pega o escribe el código del QR"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoComplete="off"
          />
        </div>
        <SubmitButton className="w-fit">
          <ScanLine className="size-4" /> Verificar
        </SubmitButton>
        {checkState.error && <p className="text-sm text-destructive">{checkState.error}</p>}
      </form>

      {ticket && info && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-2">
              {info.ok ? (
                <CheckCircle2 className="size-5 text-success-500" />
              ) : (
                <XCircle className="size-5 text-danger-500" />
              )}
              <span className="text-sm font-medium text-foreground">{info.label}</span>
              <Badge variant={info.ok ? "success" : "danger"}>{effectiveStatus}</Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{ticket.serial}</p>

            {effectiveStatus === "active" && (
              <form action={markUsedAction} className="w-fit">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <SubmitButton>Confirmar ingreso</SubmitButton>
              </form>
            )}
            {useState_.error && <p className="text-sm text-destructive">{useState_.error}</p>}
            {useState_.success && <p className="text-sm text-success-600">{useState_.success}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { ValidateForm };
