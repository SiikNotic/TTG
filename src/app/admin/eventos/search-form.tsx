"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "borrador", label: "Borrador" },
  { value: "publicado", label: "Publicado" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
];

function EventSearchForm({ defaultSearch, defaultStatus }: { defaultSearch: string; defaultStatus: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState(defaultStatus);

  function apply() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    router.push(params.size > 0 ? `/admin/eventos?${params.toString()}` : "/admin/eventos");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Buscar por título…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        className="max-w-xs"
      />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" onClick={apply}>
        Buscar
      </Button>
    </div>
  );
}

export { EventSearchForm };
