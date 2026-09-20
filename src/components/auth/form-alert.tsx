"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/auth";

function FormAlert({ state }: { state: ActionState }) {
  const ref = useRef<HTMLDivElement>(null);

  // En formularios largos (ej. crear evento), un error que aparece arriba
  // del todo puede quedar fuera de la vista si el usuario ya scrolleó hacia
  // el botón de enviar: sin esto, el submit "no hace nada" visiblemente.
  useEffect(() => {
    if (state.error || state.success) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  if (state.error) {
    return (
      <div
        ref={ref}
        role="alert"
        className="mb-4 flex items-start gap-2 rounded-md bg-danger-500/10 p-3 text-sm text-danger-600"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>{state.error}</span>
      </div>
    );
  }
  if (state.success) {
    return (
      <div
        ref={ref}
        role="status"
        className="mb-4 flex items-start gap-2 rounded-md bg-success-500/10 p-3 text-sm text-success-600"
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>{state.success}</span>
      </div>
    );
  }
  return null;
}

export { FormAlert };
