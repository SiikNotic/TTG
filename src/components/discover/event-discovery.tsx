"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state-message";
import { EventCard } from "@/components/discover/event-card";
import { CategoryFilter } from "@/components/discover/category-filter";
import { FiltersBar, type CityFilter, type DateFilter, type PriceFilter } from "@/components/discover/filters-bar";
import type { EventCategory } from "@/lib/categories";
import type { PublicEventSummary } from "@/lib/discovery";

interface EventDiscoveryProps {
  events: PublicEventSummary[];
}

const FEATURED_COUNT = 3;

function matchesDate(event: PublicEventSummary, filter: DateFilter) {
  if (filter === "cualquiera") return true;
  const start = new Date(event.startsAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "hoy") {
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    return start >= startOfToday && start < endOfToday;
  }

  if (filter === "finde") {
    const day = startOfToday.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const saturday = new Date(startOfToday);
    saturday.setDate(saturday.getDate() + daysUntilSaturday);
    const mondayAfter = new Date(saturday);
    mondayAfter.setDate(mondayAfter.getDate() + 2);
    return start >= saturday && start < mondayAfter;
  }

  if (filter === "mes") {
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  }

  return true;
}

function EventDiscovery({ events }: EventDiscoveryProps) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<EventCategory | "todas">("todas");
  const [date, setDate] = React.useState<DateFilter>("cualquiera");
  const [price, setPrice] = React.useState<PriceFilter>("cualquiera");
  const [city, setCity] = React.useState<CityFilter>("todas");

  const cities = React.useMemo(
    () => Array.from(new Set(events.map((e) => e.city))).sort((a, b) => a.localeCompare(b)),
    [events]
  );

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      if (category !== "todas" && event.category !== category) return false;
      if (city !== "todas" && event.city !== city) return false;
      if (price === "gratis" && event.priceFrom !== 0) return false;
      if (price === "pago" && (event.priceFrom === null || event.priceFrom === 0)) return false;
      if (!matchesDate(event, date)) return false;
      if (query) {
        const haystack = `${event.title} ${event.venueName} ${event.city}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [events, category, city, price, date, search]);

  const hasActiveFilters = search.trim() !== "" || category !== "todas" || date !== "cualquiera" || price !== "cualquiera" || city !== "todas";
  const featuredEvents = events.slice(0, FEATURED_COUNT);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Input
          startIcon={<Search />}
          placeholder="Buscar eventos, lugares o ciudades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar eventos"
          className="h-12 text-base"
        />
        <CategoryFilter value={category} onChange={setCategory} />
        <FiltersBar
          date={date}
          onDateChange={setDate}
          price={price}
          onPriceChange={setPrice}
          city={city}
          onCityChange={setCity}
          cities={cities}
        />
      </div>

      {!hasActiveFilters && featuredEvents.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Próximamente</h2>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {featuredEvents.map((event) => (
              <div key={event.id} className="snap-start">
                <EventCard event={event} variant="featured" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {hasActiveFilters ? `Resultados (${filtered.length})` : "Próximos eventos"}
        </h2>
        {filtered.length === 0 ? (
          <EmptyState
            title="No encontramos eventos con estos filtros"
            description="Prueba ajustando la categoría, la fecha o el precio."
            action={{
              label: "Limpiar filtros",
              onClick: () => {
                setSearch("");
                setCategory("todas");
                setDate("cualquiera");
                setPrice("cualquiera");
                setCity("todas");
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export { EventDiscovery };
