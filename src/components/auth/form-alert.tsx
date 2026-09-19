import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/auth";

function FormAlert({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <div role="alert" className="mb-4 flex items-start gap-2 rounded-md bg-danger-500/10 p-3 text-sm text-danger-600">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>{state.error}</span>
      </div>
    );
  }
  if (state.success) {
    return (
      <div role="status" className="mb-4 flex items-start gap-2 rounded-md bg-success-500/10 p-3 text-sm text-success-600">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>{state.success}</span>
      </div>
    );
  }
  return null;
}

export { FormAlert };
