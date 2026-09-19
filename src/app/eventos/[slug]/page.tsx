import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, ShieldAlert, ExternalLink, BadgeCheck } from "lucide-react";

import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EventCover } from "@/components/discover/event-cover";
import { EventStatusBadge } from "@/components/discover/event-status-badge";
import { EventActions } from "@/components/discover/event-actions";
import { DemoDataBanner } from "@/components/discover/demo-data-banner";
import { EVENTS, getCategoryMeta, getEventBySlug } from "@/data/events";
import { formatDateLong, formatPrice, formatTime } from "@/lib/format";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado — TTG" };
  return {
    title: `${event.title} — TTG`,
    description: event.description,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const category = getCategoryMeta(event.category);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venueName}, ${event.address}, ${event.city}`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <CalendarDays className="size-4" />
              </span>
              TTG
            </NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <EventCover category={event.category} className="aspect-[21/9] w-full sm:aspect-[3/1]" iconClassName="size-10" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <DemoDataBanner />
        </div>

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a eventos
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="brand">{category.label}</Badge>
                {event.status !== "disponible" && <EventStatusBadge status={event.status} />}
                {event.ageRestriction && (
                  <Badge variant="outline">
                    <ShieldAlert className="size-3.5" /> {event.ageRestriction}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {event.title}
              </h1>

              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" />
                  <span>
                    {formatDateLong(event.dateStart)} · {formatTime(event.dateStart)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  <span>
                    {event.venueName} — {event.address}, {event.city}
                  </span>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-2 text-base font-semibold text-foreground">Acerca del evento</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-foreground">Reglas del evento</h2>
              <ul className="flex flex-col gap-2">
                {event.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-foreground">Ubicación</h2>
              <Card>
                <CardContent className="flex flex-col gap-3 pt-5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.venueName}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.address}, {event.city}
                    </p>
                  </div>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Ver en el mapa <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-5">
                <div>
                  <p className="text-xs text-muted-foreground">Precio desde</p>
                  <p className="text-2xl font-semibold text-foreground">{formatPrice(event.priceFrom)}</p>
                </div>
                <EventActions slug={event.slug} title={event.title} status={event.status} />
                {event.status === "cancelado" && (
                  <p className="text-xs text-muted-foreground">
                    Este evento fue cancelado por la organización. Si compraste una entrada (demo), no se
                    requiere ninguna acción.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Organizador
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {event.organizer.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.organizer.name}</p>
                      {event.organizer.verified && (
                        <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Organizador verificado" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{event.organizer.eventsCount} eventos organizados</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{event.organizer.bio}</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
