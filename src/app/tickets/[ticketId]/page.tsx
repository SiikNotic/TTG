import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CalendarDays, MapPin, ShieldAlert, AlertTriangle } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { getTicketForViewer } from "@/lib/tickets";
import { getTicketQrPayload } from "@/lib/actions/tickets";
import { getCategoryMeta } from "@/lib/categories";
import { formatInTimeZone } from "@/lib/timezone";
import { parseRules, ruleDescriptions } from "@/lib/event-rules";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

interface TicketPageProps {
  params: Promise<{ ticketId: string }>;
}

const STATUS_MESSAGES: Record<string, { title: string; tone: "warning" | "danger" }> = {
  used: { title: "Esta entrada ya fue utilizada.", tone: "warning" },
  cancelled: { title: "Esta entrada fue cancelada.", tone: "danger" },
  refunded: { title: "Esta entrada fue reembolsada.", tone: "danger" },
  expired: { title: "Esta entrada expiró: el evento ya finalizó.", tone: "warning" },
};

export default async function TicketPage({ params }: TicketPageProps) {
  const { ticketId } = await params;
  const result = await getTicketForViewer(ticketId);
  if (!result || !result.isOwner) notFound();

  const { ticket, ticketType, event } = result;
  const category = getCategoryMeta(event.category);
  const rules = ruleDescriptions(parseRules(event.rules), event.min_age);

  let qrSvg: string | null = null;
  if (ticket.status === "active") {
    const { token } = await getTicketQrPayload(ticket.id);
    if (token) {
      qrSvg = await QRCode.toString(token, { type: "svg", margin: 1, width: 220, color: { dark: "#101014" } });
    }
  }

  const statusMessage = STATUS_MESSAGES[ticket.status];

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <RealtimeRefresher channelName={`ticket-${ticketId}`} subscriptions={[{ table: "tickets", filter: `id=eq.${ticketId}` }]} />
      <div className="print:hidden">
        <Navbar>
          <NavbarInner>
            <NavbarBrand>Tu entrada</NavbarBrand>
          </NavbarInner>
        </Navbar>
      </div>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        {statusMessage && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-md p-3 text-sm print:hidden ${
              statusMessage.tone === "danger" ? "bg-danger-500/10 text-danger-600" : "bg-warning-500/10 text-warning-600"
            }`}
          >
            <AlertTriangle className="size-4 shrink-0" />
            {statusMessage.title}
          </div>
        )}

        <Card className="overflow-hidden print:border-none print:shadow-none">
          <div className="border-b border-border bg-accent px-5 py-4">
            <div className="flex items-center justify-between">
              <Badge variant="brand">{category.label}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{ticket.serial}</span>
            </div>
            <h1 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h1>
          </div>

          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            {qrSvg ? (
              <div
                className="rounded-lg border border-border bg-white p-3"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="flex size-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Sin código para mostrar
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatInTimeZone(event.starts_at, event.timezone)}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue_name} · {event.city}
              </p>
            </div>

            <p className="text-sm font-medium text-foreground">{ticketType.name}</p>

            <div className="w-full border-t border-border pt-4 text-left">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <ShieldAlert className="size-3.5" /> Reglas del evento
              </p>
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                {rules.map((rule, i) => (
                  <li key={i} className={i === 0 ? "font-medium text-foreground" : undefined}>
                    • {rule}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <PrintButton />
        </div>
      </main>
    </div>
  );
}
