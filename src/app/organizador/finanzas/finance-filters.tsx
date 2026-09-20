"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { OrganizerEventOption, OrganizerTicketTypeOption } from "@/lib/finance";

const TX_TYPES = [
  { value: "all", label: "Todas" },
  { value: "charge", label: "Cobros" },
  { value: "refund", label: "Reembolsos" },
  { value: "dispute", label: "Disputas" },
];

function FinanceFiltersForm({
  events,
  ticketTypes,
}: {
  events: OrganizerEventOption[];
  ticketTypes: OrganizerTicketTypeOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [eventId, setEventId] = useState(searchParams.get("eventId") ?? "all");
  const [ticketTypeId, setTicketTypeId] = useState(searchParams.get("ticketTypeId") ?? "all");
  const [transactionType, setTransactionType] = useState(searchParams.get("type") ?? "all");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");

  const visibleTicketTypes = eventId === "all" ? ticketTypes : ticketTypes.filter((t) => t.eventId === eventId);

  function apply() {
    const params = new URLSearchParams();
    if (eventId !== "all") params.set("eventId", eventId);
    if (ticketTypeId !== "all") params.set("ticketTypeId", ticketTypeId);
    if (transactionType !== "all") params.set("type", transactionType);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  function reset() {
    setEventId("all");
    setTicketTypeId("all");
    setTransactionType("all");
    setDateFrom("");
    setDateTo("");
    router.push(pathname);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="grid gap-1.5">
        <Label htmlFor="filter-event">Evento</Label>
        <Select
          value={eventId}
          onValueChange={(v) => {
            setEventId(v);
            setTicketTypeId("all");
          }}
        >
          <SelectTrigger id="filter-event">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los eventos</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filter-ticket-type">Tipo de entrada</Label>
        <Select value={ticketTypeId} onValueChange={setTicketTypeId}>
          <SelectTrigger id="filter-ticket-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {visibleTicketTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filter-type">Tipo de transacción</Label>
        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger id="filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TX_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filter-from">Desde</Label>
        <Input id="filter-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="filter-to">Hasta</Label>
        <Input id="filter-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="button" size="sm" onClick={apply}>
          Aplicar filtros
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={reset}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}

export { FinanceFiltersForm };
