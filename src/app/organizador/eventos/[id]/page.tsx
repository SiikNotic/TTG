import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { EventStatusActions } from "@/components/organizer/event-status-actions";
import { EventCoverForm } from "@/components/organizer/event-cover-form";
import { EventForm, type EventFormDefaults } from "@/components/organizer/event-form";
import { TicketTypeManager } from "@/components/organizer/ticket-type-manager";
import { getCategoryMeta } from "@/lib/categories";
import { getEventForOrganizer } from "@/lib/organizer";
import { updateEvent } from "@/lib/actions/events";
import { utcToZonedParts } from "@/lib/timezone";
import { parseRules } from "@/lib/event-rules";

export const dynamic = "force-dynamic";

interface EventManagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EventManagePage({ params }: EventManagePageProps) {
  const { id } = await params;
  const result = await getEventForOrganizer(id);
  if (!result) notFound();

  const { event, ticketTypes } = result;
  const category = getCategoryMeta(event.category);
  const { date, time } = utcToZonedParts(event.starts_at, event.timezone);
  const rules = parseRules(event.rules);

  const ageOption: EventFormDefaults["ageOption"] =
    event.min_age === null ? "todas" : event.min_age === 18 ? "18" : event.min_age === 21 ? "21" : "custom";

  const defaults: EventFormDefaults = {
    eventId: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    date,
    time,
    timezone: event.timezone,
    venueName: event.venue_name,
    address: event.address,
    city: event.city,
    capacity: String(event.capacity),
    ageOption,
    customAge: ageOption === "custom" ? String(event.min_age) : "",
    rules,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Administrar evento</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/organizador"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="brand">{category.label}</Badge>
          <EventStatusBadge status={event.status} />
        </div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{event.title}</h1>

        <div className="mb-8">
          <EventStatusActions eventId={event.id} status={event.status} />
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Portada</h2>
          <EventCoverForm eventId={event.id} coverUrl={event.cover_image_url} category={event.category} />
        </div>

        <div className="mb-8">
          <TicketTypeManager eventId={event.id} ticketTypes={ticketTypes} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Detalles del evento</h2>
          <Card>
            <CardContent className="pt-6">
              <EventForm action={updateEvent} defaults={defaults} submitLabel="Guardar cambios" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
