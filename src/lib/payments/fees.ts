import "server-only";

/** Stripe espera montos en centavos (unidad mínima de USD): precio * 100. */
export function toStripeAmount(usdValue: number): number {
  return Math.round(usdValue * 100);
}

const DEFAULT_PLATFORM_FEE_BPS = 500; // 5%

/** Comisión de plataforma sobre un monto ya en centavos (unidad Stripe). */
export function computePlatformFee(amountInStripeUnits: number): number {
  const bps = Number(process.env.PLATFORM_FEE_BPS ?? DEFAULT_PLATFORM_FEE_BPS);
  return Math.round((amountInStripeUnits * bps) / 10000);
}
