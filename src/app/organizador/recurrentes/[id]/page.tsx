import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { VenueSeriesForm, type VenueSeriesFormDefaults } from "@/components/organizer/venue-series-form";
import { getVenueSeriesForOrganizer } from "@/lib/organizer";
import { updateVenueSeries } from "@/lib/actions/venue-series";
import { getCategoryMeta } from "@/lib/categories";
import { formatInTimeZone } from "@/lib/timezone";
import { VenueSeriesStatusForm } from "./status-form";

export const dynamic = "force-dynamic";

interface VenueSeriesPageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueSeriesManagePage({ params }: VenueSeriesPageProps) {
  const { id } = await params;
  const result = await getVenueSeriesForOrganizer(id);
  if (!result) notFound();

  const { series, upcomingEvents } = result;
  const category = getCategoryMeta(series.category);

  const ageOption: VenueSeriesFormDefaults["ageOption"] =
    series.min_age === null ? "todas" : series.min_age === 18 ? "18" : series.min_age === 21 ? "21" : "custom";

  const defaults: VenueSeriesFormDefaults = {
    seriesId: series.id,
    title: series.title,
    description: series.description,
    category: series.category,
    venueName: series.venue_name,
    address: series.address,
    city: series.city,
    timezone: series.timezone,
    coverPrice: String(series.cover_price),
    capacity: String(series.capacity),
    ageOption,
    customAge: ageOption === "custom" ? String(series.min_age) : "",
    openWeekdays: series.open_weekdays,
    openTime: series.open_time,
    closeTime: series.close_time ?? "",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>{series.title}</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/organizador/recurrentes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="brand">{category.label}</Badge>
          <Badge variant={series.status === "activa" ? "success" : "neutral"}>
            {series.status === "activa" ? "Activo" : "Pausado"}
          </Badge>
        </div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{series.title}</h1>

        <div className="mb-8">
          <VenueSeriesStatusForm seriesId={series.id} status={series.status} />
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Próximos eventos generados</h2>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-5" />}
              title="Todavía no hay eventos generados"
              description="Se generan automáticamente para los próximos 14 días abiertos."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((e) => (
                <Link key={e.id} href={`/organizador/eventos/${e.id}`} className="block">
                  <Card interactive>
                    <CardContent className="flex items-center justify-between gap-3 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {formatInTimeZone(e.starts_at, e.timezone)}
                      </p>
                      <EventStatusBadge status={e.status} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Configuración</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Los cambios solo afectan a los eventos que se generen de ahora en adelante — no a los que ya existen
            (algunos pueden tener entradas vendidas).
          </p>
          <Card>
            <CardContent className="pt-6">
              <VenueSeriesForm action={updateVenueSeries} defaults={defaults} submitLabel="Guardar cambios" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
