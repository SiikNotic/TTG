/**
 * Traduce mensajes de error de Supabase Auth al español, sin filtrar
 * detalles internos. Cualquier mensaje no reconocido cae en un genérico.
 */
const KNOWN_ERRORS: [match: string, message: string][] = [
  ["Invalid login credentials", "Correo o contraseña incorrectos."],
  ["User already registered", "Ya existe una cuenta con este correo."],
  ["Email not confirmed", "Debes confirmar tu correo antes de iniciar sesión."],
  ["Password should be at least", "La contraseña es demasiado corta."],
  ["New password should be different", "La nueva contraseña debe ser distinta a la actual."],
  ["For security purposes", "Por seguridad, espera un momento antes de volver a intentarlo."],
  ["Auth session missing", "Tu sesión expiró. Vuelve a intentarlo."],
  ["Unable to validate email address", "El correo ingresado no es válido."],
  ["signup_disabled", "El registro no está disponible en este momento."],
];

export function translateAuthError(message: string | undefined | null): string {
  if (!message) return "Ocurrió un error. Intenta de nuevo.";
  const found = KNOWN_ERRORS.find(([match]) => message.includes(match));
  return found ? found[1] : "Ocurrió un error. Intenta de nuevo.";
}
