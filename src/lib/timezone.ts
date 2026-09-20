/**
 * Utilidades de zona horaria sin dependencias externas. Usan el truco
 * estándar de doble conversión con Intl para calcular el offset de una
 * IANA timezone en un instante dado (correcto incluso con DST, salvo el
 * borde exacto de la transición).
 */

export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-3/-4)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/Caracas", label: "Caracas (GMT-4)" },
  { value: "America/Guayaquil", label: "Quito / Guayaquil (GMT-5)" },
  { value: "America/New_York", label: "Nueva York (GMT-5/-4)" },
  { value: "America/Puerto_Rico", label: "Puerto Rico (GMT-4)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8/-7)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1/+2)" },
];

/** Convierte una fecha y hora "de pared" en una zona horaria a un instante UTC ISO. */
export function zonedTimeToUtcISOString(dateStr: string, timeStr: string, timeZone: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const utcGuess = Date.UTC(year!, month! - 1, day!, hour!, minute!);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(new Date(utcGuess));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const representedAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  const offset = representedAsUtc - utcGuess;
  return new Date(utcGuess - offset).toISOString();
}

/** Descompone un instante ISO en fecha/hora "de pared" para una zona horaria (para prellenar formularios). */
export function utcToZonedParts(iso: string, timeZone: string): { date: string; time: string } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** Formatea un instante ISO en la zona horaria del evento, para mostrar. */
export function formatInTimeZone(iso: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const formatted = formatter.format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Fecha corta (para tarjetas/listas), en la zona horaria del evento. */
export function formatDateShortInTimeZone(iso: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formatted = formatter.format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Solo la fecha (sin hora), en la zona horaria del evento. */
export function formatDateInTimeZone(iso: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formatted = formatter.format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Solo la hora (sin fecha), en la zona horaria del evento. */
export function formatTimeInTimeZone(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("es-CO", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function timezoneLabel(timeZone: string) {
  return TIMEZONES.find((t) => t.value === timeZone)?.label ?? timeZone;
}
