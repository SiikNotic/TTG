import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { ValidateForm } from "./validate-form";

export const dynamic = "force-dynamic";

export default function ValidateTicketPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>Validar entrada</NavbarBrand>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-md px-4 py-8 sm:px-6">
        <Link
          href="/organizador"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </Link>

        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Validar entrada</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Escribe o pega el código del QR de la entrada para verificar si es válida.
        </p>

        <ValidateForm />
      </main>
    </div>
  );
}
