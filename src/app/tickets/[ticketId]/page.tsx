import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CalendarDays, Clock, MapPin, ShieldAlert, AlertTriangle, User, Ticket as TicketIcon } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresher } from "@/components/realtime/realtime-refresher";
import { EventCover } from "@/components/discover/event-cover";
import { getTicketForViewer } from "@/lib/tickets";
import { getTicketQrPayload } from "@/lib/actions/tickets";
import { getCategoryMeta } from "@/lib/categories";
import { formatDateInTimeZone, formatTimeInTimeZone } from "@/lib/timezone";
import { parseRules, ruleDescriptions } from "@/lib/event-rules";
import { PrintButton } from "./print-button";
import { ShareButton } from "./share-button";

export const dynamic = "force-dynamic";

interface TicketPageProps {
  params: Promise<{ ticketId: string }>;
}

const STATUS_INFO: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral"; notice?: string }> = {
  active: { label: "Activa", variant: "success" },
  used: { label: "Usada", variant: "neutral", notice: "Esta entrada ya fue utilizada." },
  cancelled: { label: "Cancelada", variant: "danger", notice: "Esta entrada fue cancelada." },
  refunded: { label: "Reembolsada", variant: "danger", notice: "Esta entrada fue reembolsada." },
  expired: { label: "Expirada", variant: "warning", notice: "Esta entrada expiró: el evento ya finalizó." },
  disputed: { label: "En disputa", variant: "warning", notice: "Esta entrada está en disputa y no permite el ingreso." },
};

export default async function TicketPage({ params }: TicketPageProps) {
  const { ticketId } = await params;
  const result = await getTicketForViewer(ticketId);
  if (!result || !result.isOwner) notFound();

  const { ticket, ticketType, event, buyerName, organizer } = result;
  const category = getCategoryMeta(event.category);
  const rules = ruleDescriptions(parseRules(event.rules), event.min_age);

  // El QR solo se pide (y solo existe) si el estado ACTUAL en el servidor
  // es 'active'. Un PDF viejo de una entrada que después se reembolsó o
  // canceló no puede "revivir" el código: al volver a esta página, ya no
  // se genera. Y si alguien igual escanea el QR de ese PDF viejo, la
  // validación en el organizador vuelve a resolver el estado actual por
  // hash (no por lo que diga el PDF), así que se rechaza igual.
  let qrSvg: string | null = null;
  if (ticket.status === "active") {
    const { token } = await getTicketQrPayload(ticket.id);
    if (token) {
      qrSvg = await QRCode.toString(token, { type: "svg", margin: 1, width: 220, color: { dark: "#101014" } });
    }
  }

  const status = STATUS_INFO[ticket.status] ?? STATUS_INFO.active!;

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
        {status.notice && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-md p-3 text-sm ${
              status.variant === "danger" ? "bg-danger-500/10 text-danger-600" : "bg-warning-500/10 text-warning-600"
            }`}
          >
            <AlertTriangle className="size-4 shrink-0" />
            {status.notice}
          </div>
        )}

        <Card className="overflow-hidden print:border-none print:shadow-none">
          <div className="aspect-video w-full">
            {event.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- portada viene de Supabase Storage.
              <img src={event.cover_image_url} alt="" className="size-full object-cover" />
            ) : (
              <EventCover category={event.category} className="size-full" iconClassName="size-10" />
            )}
          </div>

          <div className="border-b border-border bg-accent px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand">{category.label}</Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{ticket.serial}</span>
            </div>
            <h1 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h1>
          </div>

          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDateInTimeZone(event.starts_at, event.timezone)}
              </p>
              <p className="flex items-center justify-center gap-1.5">
                <Clock className="size-4" />
                {formatTimeInTimeZone(event.starts_at, event.timezone)}
              </p>
              <p className="flex items-center justify-center gap-1.5">
                <MapPin className="size-4" />
                {event.venue_name} · {event.city}
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 text-left">
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <User className="size-3" /> Comprador
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{buyerName || "—"}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TicketIcon className="size-3" /> Tipo de entrada
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{ticketType.name}</p>
              </div>
            </div>

            {qrSvg ? (
              <div
                className="rounded-lg border border-border bg-white p-3"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="flex size-56 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Sin código para mostrar
              </div>
            )}

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

            <div className="w-full border-t border-border pt-4 text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Organizador</p>
              <div className="flex items-center gap-3">
                {organizer.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- logo viene de Supabase Storage.
                  <img src={organizer.logoUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-semibold text-muted-foreground">
                    {(organizer.displayName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {organizer.displayName || "Organizador"}
                  </p>
                  {organizer.websiteUrl && (
                    <a
                      href={organizer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-primary hover:underline print:hidden"
                    >
                      {organizer.websiteUrl}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-2 print:hidden">
          <PrintButton />
          <ShareButton title={`Entrada: ${event.title}`} />
        </div>
      </main>
    </div>
  );
}
