import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { VenueSeriesForm } from "@/components/organizer/venue-series-form";
import { createVenueSeries } from "@/lib/actions/venue-series";

export const dynamic = "force-dynamic";

export default function NewVenueSeriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Nuevo negocio recurrente</NavbarBrand>
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

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Crear negocio recurrente</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Se generan automáticamente los eventos de los próximos 14 días abiertos. No tienes que volver a crear
          nada cada semana.
        </p>

        <Card>
          <CardContent className="pt-6">
            <VenueSeriesForm action={createVenueSeries} submitLabel="Crear negocio" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
