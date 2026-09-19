"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = [
  { value: "asistente", label: "Asistente", description: "Quiero descubrir y comprar entradas para eventos." },
  { value: "organizador", label: "Organizador", description: "Quiero crear y gestionar mis propios eventos." },
] as const;

function RegisterForm() {
  const [state, formAction] = useActionState(signUp, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormAlert state={state} />

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-foreground">Tipo de cuenta</legend>
        {ACCOUNT_TYPES.map((type, i) => (
          <label
            key={type.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border border-border-strong p-3",
              "has-[:checked]:border-primary has-[:checked]:bg-accent",
              "transition-colors duration-fast ease-standard"
            )}
          >
            <input
              type="radio"
              name="role"
              value={type.value}
              defaultChecked={i === 0}
              className="mt-1 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{type.label}</span>
              <span className="block text-xs text-muted-foreground">{type.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <FieldHelp>Mínimo 8 caracteres.</FieldHelp>
      </div>

      <SubmitButton>Crear cuenta</SubmitButton>

      <p className="text-center text-xs text-muted-foreground">
        Las cuentas de administrador de plataforma no se crean desde este formulario.
      </p>
    </form>
  );
}

export { RegisterForm };
