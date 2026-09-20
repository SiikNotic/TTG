import "server-only";

/**
 * PAYPAL_MODE=live usa la API real; cualquier otro valor (o sin configurar)
 * usa el sandbox de pruebas, igual que el par test/live de Stripe.
 */
function apiBase() {
  return process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal no está configurado.");

  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("No se pudo autenticar con PayPal.");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface PaypalPayoutResult {
  batchId: string;
  status: string;
}

/**
 * Crea un payout de un solo ítem. El batch de PayPal es async por diseño:
 * "processing" acá NO significa que ya le llegó el dinero al organizador,
 * solo que PayPal aceptó la solicitud — el estado final se consulta
 * después con getPaypalPayoutStatus.
 */
export async function createPaypalPayout(params: {
  receiverEmail: string;
  amountInCents: number;
  currency: string;
  note: string;
  senderItemId: string;
}): Promise<PaypalPayoutResult> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v1/payments/payouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: params.senderItemId,
        email_subject: "Has recibido un pago",
        email_message: params.note,
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: { value: (params.amountInCents / 100).toFixed(2), currency: params.currency.toUpperCase() },
          receiver: params.receiverEmail,
          note: params.note,
          sender_item_id: params.senderItemId,
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data?.message === "string" ? data.message : "PayPal rechazó el payout.");
  }
  return { batchId: data.batch_header?.payout_batch_id, status: data.batch_header?.batch_status };
}

const FAILED_ITEM_STATUSES = new Set(["FAILED", "RETURNED", "BLOCKED", "REFUNDED", "DENIED"]);

/** Refresca el estado real del batch contra PayPal (no hay webhook configurado todavía). */
export async function getPaypalPayoutStatus(batchId: string): Promise<"processing" | "completed" | "failed"> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v1/payments/payouts/${batchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data?.message === "string" ? data.message : "No se pudo consultar el payout en PayPal.");
  }

  const items = (data.items ?? []) as { transaction_status: string }[];
  if (items.length === 0) return "processing";
  if (items.some((i) => FAILED_ITEM_STATUSES.has(i.transaction_status))) return "failed";
  if (items.every((i) => i.transaction_status === "SUCCESS")) return "completed";
  return "processing";
}
