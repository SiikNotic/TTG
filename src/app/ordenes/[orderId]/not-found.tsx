import Link from "next/link";
import { XCircle } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { EmptyState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Tu reserva</NavbarBrand>
          </Link>
        </NavbarInner>
      </Navbar>
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<XCircle className="size-5" />}
          title="No encontramos esta reserva"
          description="No existe, o no te pertenece."
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
