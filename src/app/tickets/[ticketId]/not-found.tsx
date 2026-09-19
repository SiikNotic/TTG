import Link from "next/link";
import { TicketX } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { EmptyState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";

export default function TicketNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Tu entrada</NavbarBrand>
        </NavbarInner>
      </Navbar>
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<TicketX className="size-5" />}
          title="No encontramos esta entrada"
          description="No existe, o no te pertenece."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/mis-tickets">Mis entradas</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
