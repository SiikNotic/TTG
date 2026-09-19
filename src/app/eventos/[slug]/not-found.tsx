import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { EmptyState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>TTG</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<CalendarX className="size-5" />}
          title="No encontramos este evento"
          description="Puede que el enlace esté mal escrito o que el evento ya no esté disponible."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/">Volver a eventos</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
