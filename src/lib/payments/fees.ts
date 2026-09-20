import "server-only";

/**
 * Stripe espera montos en la unidad mínima de la moneda. El COP NO es una
 * moneda "zero-decimal" para Stripe (a diferencia de, p. ej., JPY): aunque
 * en Colombia no se usan centavos en la práctica, la API sigue esperando
 * el monto en centavos (precio_COP * 100). Verificado contra la
 * documentación vigente de Stripe antes de implementar esto (ver notas de
 * la Etapa 7).
 */
export function toStripeAmount(copValue: number): number {
  return Math.round(copValue * 100);
}

const DEFAULT_PLATFORM_FEE_BPS = 500; // 5%

/** Comisión de plataforma sobre un monto ya en centavos (unidad Stripe). */
export function computePlatformFee(amountInStripeUnits: number): number {
  const bps = Number(process.env.PLATFORM_FEE_BPS ?? DEFAULT_PLATFORM_FEE_BPS);
  return Math.round((amountInStripeUnits * bps) / 10000);
}
