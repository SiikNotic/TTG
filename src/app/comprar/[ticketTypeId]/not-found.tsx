import Link from "next/link";
import { TicketX } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { EmptyState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";

export default function CheckoutNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Comprar entradas</NavbarBrand>
        </NavbarInner>
      </Navbar>
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<TicketX className="size-5" />}
          title="No disponible"
          description="Este tipo de entrada no existe o el evento no está a la venta."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
