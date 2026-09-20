"use client";

import { useActionState, useState } from "react";
import { adminSetUserRole } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";

const ROLES = [
  { value: "asistente", label: "Asistente" },
  { value: "organizador", label: "Organizador" },
  { value: "admin", label: "Admin" },
];

function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [state, formAction] = useActionState(adminSetUserRole, INITIAL_ACTION_STATE);
  const [role, setRole] = useState(currentRole);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="newRole" value={role} />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {role !== currentRole && (
        <SubmitButton size="sm" variant="outline">
          Guardar
        </SubmitButton>
      )}
      {state.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export { RoleForm };
