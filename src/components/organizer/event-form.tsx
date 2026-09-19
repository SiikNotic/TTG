"use client";

import { useActionState, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { TIMEZONES } from "@/lib/timezone";
import { RULE_TOGGLES, type EventRules } from "@/lib/event-rules";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { ActionState } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";

export interface EventFormDefaults {
  eventId?: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  capacity: string;
  ageOption: "todas" | "18" | "21" | "custom";
  customAge: string;
  rules: EventRules;
}

const EMPTY_DEFAULTS: EventFormDefaults = {
  title: "",
  description: "",
  category: "",
  date: "",
  time: "",
  timezone: "America/Bogota",
  venueName: "",
  address: "",
  city: "",
  capacity: "",
  ageOption: "todas",
  customAge: "",
  rules: { idRequired: false, invitationCode: false, studentsOnly: false, membersOnly: false, promoCode: false, custom: [] },
};

interface EventFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Partial<EventFormDefaults>;
  submitLabel: string;
}

function EventForm({ action, defaults, submitLabel }: EventFormProps) {
  const values = { ...EMPTY_DEFAULTS, ...defaults };
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  const [ageOption, setAgeOption] = useState(values.ageOption);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormAlert state={state} />
      {values.eventId && <input type="hidden" name="eventId" value={values.eventId} />}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Información básica</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Nombre del evento</Label>
          <Input id="title" name="title" defaultValue={values.title} required maxLength={120} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" defaultValue={values.description} rows={4} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="category">Categoría</Label>
          <Select name="category" defaultValue={values.category || undefined}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Fecha y hora</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" name="date" type="date" defaultValue={values.date} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="time">Hora</Label>
            <Input id="time" name="time" type="time" defaultValue={values.time} required />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="timezone">Zona horaria</Label>
          <Select name="timezone" defaultValue={values.timezone}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Ubicación y capacidad</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="venueName">Nombre del lugar</Label>
          <Input id="venueName" name="venueName" defaultValue={values.venueName} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={values.address} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" defaultValue={values.city} required />
          </div>
        </div>
        <div className="grid gap-1.5 sm:w-48">
          <Label htmlFor="capacity">Capacidad total</Label>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={values.capacity} required />
          <FieldHelp>La suma de tus tipos de entrada no podrá superar este número.</FieldHelp>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Restricción de edad</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          {(
            [
              { value: "todas", label: "Todas las edades" },
              { value: "18", label: "+18" },
              { value: "21", label: "+21" },
              { value: "custom", label: "Edad personalizada" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border-strong p-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
            >
              <input
                type="radio"
                name="ageOption"
                value={opt.value}
                checked={ageOption === opt.value}
                onChange={() => setAgeOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {ageOption === "custom" && (
          <div className="grid gap-1.5 sm:w-40">
            <Label htmlFor="customAge">Edad mínima</Label>
            <Input id="customAge" name="customAge" type="number" min={1} max={100} defaultValue={values.customAge} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground">Reglas del evento</h2>
        <p className="text-xs text-muted-foreground">
          Se mostrarán claramente en la página del evento antes de la compra.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {RULE_TOGGLES.map((rule) => (
            <label key={rule.key} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name={`rule_${rule.key}`}
                defaultChecked={values.rules[rule.key]}
                className="size-4 rounded accent-[var(--color-primary)]"
              />
              {rule.label}
            </label>
          ))}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="customRules">Otras reglas (una por línea)</Label>
          <Textarea
            id="customRules"
            name="customRules"
            rows={3}
            placeholder={"No se permite el ingreso de bebidas\nCupo limitado por mesa"}
            defaultValue={values.rules.custom.join("\n")}
          />
        </div>
      </section>

      <SubmitButton className="w-fit">{submitLabel}</SubmitButton>
    </form>
  );
}

export { EventForm };
