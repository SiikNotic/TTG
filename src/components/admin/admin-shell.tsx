import type { ReactNode } from "react";
import { Navbar, NavbarInner, NavbarBrand } from "@/components/ui/navbar";
import { AdminNav } from "./admin-nav";

function AdminShell({ active, title, children }: { active: string; title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar className="pb-0">
        <NavbarInner>
          <NavbarBrand>Administración</NavbarBrand>
        </NavbarInner>
        <AdminNav active={active} />
      </Navbar>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export { AdminShell };
