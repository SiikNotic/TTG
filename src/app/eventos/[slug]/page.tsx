import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, ShieldAlert, ExternalLink, Ticket as TicketIcon } from "lucide-react";

import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { BrandMark } from "@/components/ui/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventThumbnail } from "@/components/discover/event-thumbnail";
import { ShareButton } from "@/components/share-button";
import { getPublicEventBySlug } from "@/lib/discovery";
import { getCategoryMeta } from "@/lib/categories";
import { ageRestrictionLabel, ruleDescriptions } from "@/lib/event-rules";
import { formatDateInTimeZone, formatTimeInTimeZone } from "@/lib/timezone";
import { formatPrice } from "@/lib/format";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado — TTG" };
  return {
    title: `${event.title} — TTG`,
    description: event.description,
  };
}

function initialsFrom(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase());
  return letters.join("") || "?";
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const category = getCategoryMeta(event.category);
  const rules = ruleDescriptions(event.rules, event.minAge);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venueName}, ${event.address}, ${event.city}`
  )}`;
  const allSoldOut = event.ticketTypes.length > 0 && event.ticketTypes.every((t) => t.available <= 0);
  const priceFrom = event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((t) => t.price)) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>
              <BrandMark />
              TTG
            </NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <div className="relative">
        <EventThumbnail
          category={event.category}
          coverImageUrl={event.coverImageUrl}
          alt=""
          className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
          iconClassName="size-10"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:left-6"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-6 sm:pb-7">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{category.label}</Badge>
              {event.isPast ? (
                <Badge variant="neutral">Finalizado</Badge>
              ) : allSoldOut ? (
                <Badge variant="warning">Agotado</Badge>
              ) : null}
              {event.minAge && (
                <Badge variant="outline" className="border-white/40 bg-black/20 text-white">
                  <ShieldAlert className="size-3.5" /> {ageRestrictionLabel(event.minAge)}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {event.title}
            </h1>
            <div className="flex flex-col gap-1 text-sm text-white/85 sm:flex-row sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0" />
                {formatDateInTimeZone(event.startsAt, event.timezone)} ·{" "}
                {formatTimeInTimeZone(event.startsAt, event.timezone)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {event.venueName} · {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section>
              <h2 className="mb-2 text-base font-semibold text-foreground">Acerca del evento</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-foreground">Reglas del evento</h2>
              <ul className="flex flex-col gap-2">
                {rules.map((rule, i) => (
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
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio desde</p>
                    <p className="text-2xl font-semibold text-foreground">{formatPrice(priceFrom)}</p>
                  </div>
                  <ShareButton title={event.title} />
                </div>

                {event.isPast ? (
                  <p className="text-sm text-muted-foreground">Este evento ya finalizó.</p>
                ) : event.ticketTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay entradas disponibles en este momento.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {event.ticketTypes.map((tt) => (
                      <div
                        key={tt.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{tt.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(tt.price)} · {tt.available > 0 ? `${tt.available} disponibles` : "Agotado"}
                          </p>
                        </div>
                        {tt.available > 0 ? (
                          <Button asChild size="sm">
                            <Link href={`/comprar/${tt.id}`}>
                              <TicketIcon className="size-4" /> Comprar
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" disabled>
                            Agotado
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Organizador
                </p>
                <div className="flex items-center gap-3">
                  {event.organizer.logoUrl ? (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={event.organizer.logoUrl} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {initialsFrom(event.organizer.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{event.organizer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.organizer.eventsCount} evento{event.organizer.eventsCount === 1 ? "" : "s"} publicado
                      {event.organizer.eventsCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {event.organizer.bio && <p className="text-sm text-muted-foreground">{event.organizer.bio}</p>}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
