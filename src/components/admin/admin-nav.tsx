import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/organizadores", label: "Organizadores" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/transacciones", label: "Transacciones" },
  { href: "/admin/reembolsos", label: "Reembolsos" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/riesgo", label: "Fraude/Riesgo" },
  { href: "/admin/soporte", label: "Soporte" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

function AdminNav({ active }: { active: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6" aria-label="Secciones de administración">
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={cn(
            "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active === s.href
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export { AdminNav };
