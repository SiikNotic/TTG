"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function SearchForm({ defaultSearch, defaultRole }: { defaultSearch: string; defaultRole: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [role, setRole] = useState(defaultRole);

  function apply() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    router.push(params.size > 0 ? `/admin/usuarios?${params.toString()}` : "/admin/usuarios");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Buscar por nombre…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        className="max-w-xs"
      />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los roles</SelectItem>
          <SelectItem value="asistente">Asistente</SelectItem>
          <SelectItem value="organizador">Organizador</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" size="sm" onClick={apply}>
        Buscar
      </Button>
    </div>
  );
}

export { SearchForm };
