import "server-only";
import Stripe from "stripe";

/**
 * Sin `apiVersion` explícita: usa la versión que trae fijada el SDK
 * instalado (paquete `stripe`), que es la actual al momento de instalar.
 * Fijar una fecha a mano aquí podría quedar desactualizada respecto al SDK.
 *
 * El constructor de Stripe exige un apiKey no vacío (si no, tira al
 * importar el módulo). Sin STRIPE_SECRET_KEY configurada (build, o un
 * entorno todavía sin las claves reales) se usa un placeholder: cualquier
 * llamada real a la API falla igual con un 401 de Stripe, pero no rompe
 * el build ni el arranque del servidor.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_not_configured", {
  typescript: true,
});
