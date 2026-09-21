"use client";

import { useActionState, useState } from "react";
import { createCashSale } from "@/lib/actions/cash-sales";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { formatPrice } from "@/lib/format";

interface CashSaleTicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

function CashSaleForm({ ticketTypes }: { ticketTypes: CashSaleTicketType[] }) {
  const [state, formAction] = useActionState(createCashSale, INITIAL_ACTION_STATE);
  const sellable = ticketTypes.filter((t) => t.available > 0);
  const [ticketTypeId, setTicketTypeId] = useState(sellable[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");

  if (sellable.length === 0) {
    return <p className="text-sm text-muted-foreground">No quedan entradas disponibles para vender.</p>;
  }

  const selected = sellable.find((t) => t.id === ticketTypeId) ?? sellable[0]!;
  const maxSelectable = Math.min(selected.available, 20);
  const total = selected.price * Number(quantity || 0);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />
      <input type="hidden" name="ticketTypeId" value={selected.id} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="grid gap-1.5">
        <Label htmlFor="ticketType">Tipo de entrada</Label>
        <Select
          value={selected.id}
          onValueChange={(value) => {
            setTicketTypeId(value);
            setQuantity("1");
          }}
        >
          <SelectTrigger id="ticketType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sellable.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} · {formatPrice(t.price)} ({t.available} disponibles)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5 sm:w-40">
        <Label htmlFor="quantity">Cantidad</Label>
        <Select value={quantity} onValueChange={setQuantity}>
          <SelectTrigger id="quantity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxSelectable }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border bg-surface p-3 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Precio</span>
          <span>{formatPrice(selected.price)} c/u</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Método</span>
          <span className="font-medium text-foreground">Efectivo</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <SubmitButton className="w-fit">Registrar venta</SubmitButton>
    </form>
  );
}

export { CashSaleForm };
