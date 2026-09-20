"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function TicketLookupForm({
  defaultQuery,
  basePath = "/admin/tickets",
}: {
  defaultQuery: string;
  basePath?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);

  function apply() {
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Serial o ID del ticket…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        className="max-w-xs"
      />
      <Button type="button" size="sm" onClick={apply}>
        Buscar
      </Button>
    </div>
  );
}

export { TicketLookupForm };
