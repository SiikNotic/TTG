import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { getOrderForBuyer } from "@/lib/tickets";
import { formatPrice } from "@/lib/format";
import { Countdown } from "./countdown";
import { ConfirmOrderForm, CancelOrderForm } from "./order-actions";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const result = await getOrderForBuyer(orderId);
  if (!result) notFound();

  const { order, ticketType, event, tickets } = result;

  // "expirado" es un estado calculado en el momento de leer, no algo que
  // se escriba eagerly en la fila (evita depender de un cron y evita el
  // problema de una escritura que se revertiría junto con la excepción
  // de confirm_order si el intento de confirmar llega tarde).
  const isExpiredPending =
    order.status === "pendiente" && !!order.expires_at && new Date(order.expires_at).getTime() <= Date.now();
  const effectiveStatus = isExpiredPending ? "expirado" : order.status;

  return (
    <div className="min-h-screen bg-background">
      <RealtimeRefresher
        channelName={`order-${orderId}`}
        subscriptions={[{ table: "orders", filter: `id=eq.${orderId}` }]}
      />
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Tu reserva</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">{event.title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {order.quantity} × {ticketType.name} · {formatPrice(order.unit_price)} c/u
        </p>

        {effectiveStatus === "pendiente" && (
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2 text-warning-600">
                <Clock className="size-5" />
                <span className="text-sm font-medium">Reserva pendiente de confirmación</span>
              </div>
              {order.expires_at && <Countdown expiresAt={order.expires_at} />}
              <ConfirmOrderForm orderId={order.id} />
              <CancelOrderForm orderId={order.id} />
            </CardContent>
          </Card>
        )}

        {effectiveStatus === "pagado" && (
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2 text-success-600">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-medium">Compra confirmada</span>
              </div>
              <ul className="flex flex-col gap-2">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-surface-hover"
                    >
                      <span className="font-mono">{ticket.serial}</span>
                      <span className="text-primary">Ver entrada →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {(effectiveStatus === "expirado" || effectiveStatus === "cancelado") && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <XCircle className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {effectiveStatus === "expirado"
                  ? "Esta reserva expiró sin confirmarse."
                  : "Esta reserva fue cancelada."}
              </p>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/comprar/${order.ticket_type_id}`}>Intentar de nuevo</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
