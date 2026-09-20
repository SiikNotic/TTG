"use client";

import { useActionState, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { TIMEZONES } from "@/lib/timezone";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { ActionState } from "@/lib/actions/action-state";
import { Label } from "@/components/ui/label";
import { Input, FieldHelp } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

export interface VenueSeriesFormDefaults {
  seriesId?: string;
  title: string;
  description: string;
  category: string;
  venueName: string;
  address: string;
  city: string;
  timezone: string;
  coverPrice: string;
  capacity: string;
  ageOption: "todas" | "18" | "21" | "custom";
  customAge: string;
  openWeekdays: number[];
  openTime: string;
  closeTime: string;
}

const EMPTY_DEFAULTS: VenueSeriesFormDefaults = {
  title: "",
  description: "",
  category: "",
  venueName: "",
  address: "",
  city: "",
  timezone: "America/Puerto_Rico",
  coverPrice: "0",
  capacity: "",
  ageOption: "18",
  customAge: "",
  openWeekdays: [],
  openTime: "21:00",
  closeTime: "",
};

interface VenueSeriesFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: Partial<VenueSeriesFormDefaults>;
  submitLabel: string;
}

function VenueSeriesForm({ action, defaults, submitLabel }: VenueSeriesFormProps) {
  const values = { ...EMPTY_DEFAULTS, ...defaults };
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  const [ageOption, setAgeOption] = useState(values.ageOption);
  const [openWeekdays, setOpenWeekdays] = useState<Set<number>>(new Set(values.openWeekdays));

  function toggleWeekday(day: number) {
    setOpenWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormAlert state={state} />
      {values.seriesId && <input type="hidden" name="seriesId" value={values.seriesId} />}
      {[...openWeekdays].map((d) => (
        <input key={d} type="hidden" name="openWeekdays" value={d} />
      ))}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Información básica</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Nombre del negocio</Label>
          <Input id="title" name="title" defaultValue={values.title} required maxLength={120} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" defaultValue={values.description} rows={3} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="category">Categoría</Label>
          <Select name="category" defaultValue={values.category || undefined} required>
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
        <h2 className="text-sm font-semibold text-foreground">Días y horario</h2>
        <div className="grid gap-1.5">
          <Label>¿Qué días abren?</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                aria-pressed={openWeekdays.has(d.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-fast ease-standard",
                  openWeekdays.has(d.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong bg-surface text-foreground hover:bg-surface-hover"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <FieldHelp>Cada día marcado genera automáticamente su propio evento, con su propio cupo.</FieldHelp>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="openTime">Hora de apertura</Label>
            <Input id="openTime" name="openTime" type="time" defaultValue={values.openTime} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="closeTime">Hora de cierre (opcional)</Label>
            <Input id="closeTime" name="closeTime" type="time" defaultValue={values.closeTime} />
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
        <h2 className="text-sm font-semibold text-foreground">Ubicación y cover</h2>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="coverPrice">Precio del cover (0 = gratis)</Label>
            <Input
              id="coverPrice"
              name="coverPrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={values.coverPrice}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="capacity">Cupo por día</Label>
            <Input id="capacity" name="capacity" type="number" min={1} defaultValue={values.capacity} required />
          </div>
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

      <SubmitButton className="w-fit">{submitLabel}</SubmitButton>
    </form>
  );
}

export { VenueSeriesForm };
