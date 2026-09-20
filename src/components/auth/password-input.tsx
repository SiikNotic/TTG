"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

const REQUIREMENTS: PasswordRequirement[] = [
  { label: "8+ caracteres", test: (v) => v.length >= 8 },
  { label: "una mayúscula", test: (v) => /[A-Z]/.test(v) },
  { label: "un número", test: (v) => /[0-9]/.test(v) },
  { label: "un símbolo", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH_LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
const STRENGTH_COLORS = ["bg-danger-500", "bg-danger-500", "bg-warning-500", "bg-success-500", "bg-success-500"];

interface PasswordInputProps extends Omit<InputProps, "type" | "endIcon"> {
  /** Muestra la barra de fortaleza y los requisitos que faltan (solo para contraseñas nuevas). */
  showStrength?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength, onChange, className, defaultValue, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState(String(defaultValue ?? ""));

    const metCount = REQUIREMENTS.filter((r) => r.test(value)).length;
    const missing = REQUIREMENTS.filter((r) => !r.test(value));

    return (
      <div className="flex flex-col gap-1.5">
        <Input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={className}
          defaultValue={defaultValue}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e);
          }}
          endIcon={
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="pointer-events-auto text-muted-foreground transition-colors hover:text-foreground"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        {showStrength && value.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full bg-muted transition-colors",
                    i < metCount && STRENGTH_COLORS[metCount]
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {STRENGTH_LABELS[metCount]}
              {missing.length > 0 && ` · Falta: ${missing.map((m) => m.label).join(", ")}`}
            </p>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
