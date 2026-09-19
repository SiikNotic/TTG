import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { EventForm } from "@/components/organizer/event-form";
import { createEvent } from "@/lib/actions/events";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Nuevo evento</NavbarBrand>
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

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Crear evento</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Se guarda como borrador. Podrás agregar tipos de entrada y publicarlo después.
        </p>

        <Card>
          <CardContent className="pt-6">
            <EventForm action={createEvent} submitLabel="Crear borrador" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
