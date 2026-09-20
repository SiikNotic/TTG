const dateShortFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const dateLongFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "numeric",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("es-US", {
  style: "currency",
  currency: "USD",
});

export function formatDateShort(iso: string) {
  return capitalize(normalizeSpaces(dateShortFormatter.format(new Date(iso))));
}

export function formatDateLong(iso: string) {
  return capitalize(normalizeSpaces(dateLongFormatter.format(new Date(iso))));
}

export function formatTime(iso: string) {
  return normalizeSpaces(timeFormatter.format(new Date(iso)));
}

export function formatPrice(value: number | null) {
  if (value === null || value === 0) return "Gratis";
  return normalizeSpaces(currencyFormatter.format(value));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Node y los navegadores no siempre coinciden en qué carácter de espacio
 * usa Intl (p. ej. U+202F antes de "p. m."), lo que rompe la hidratación
 * de SSR. Se normaliza todo a espacio regular para una salida determinista.
 */
function normalizeSpaces(value: string) {
  return value.replace(/[  ]/g, " ");
}
