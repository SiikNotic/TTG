"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: "all", label: "Todas" },
  { value: "charge", label: "Cobros" },
  { value: "refund", label: "Reembolsos" },
  { value: "dispute", label: "Disputas" },
];

function TransactionFiltersForm({
  basePath,
  defaultSearch,
  defaultType,
  defaultFrom,
  defaultTo,
}: {
  basePath: string;
  defaultSearch: string;
  defaultType: string;
  defaultFrom: string;
  defaultTo: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [type, setType] = useState(defaultType);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  function apply() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "all") params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(params.size > 0 ? `${basePath}?${params.toString()}` : basePath);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="grid gap-1.5">
        <Label htmlFor="tf-search">Evento</Label>
        <Input id="tf-search" placeholder="Buscar por evento…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="tf-type">Tipo</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="tf-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="tf-from">Desde</Label>
        <Input id="tf-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="tf-to">Hasta</Label>
        <Input id="tf-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="button" size="sm" onClick={apply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}

export { TransactionFiltersForm };
