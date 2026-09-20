import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supportSearch } from "@/lib/admin";
import { formatDateShort } from "@/lib/format";
import { TicketLookupForm } from "../tickets/lookup-form";

export const dynamic = "force-dynamic";

interface SupportPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSupportPage({ searchParams }: SupportPageProps) {
  const { q } = await searchParams;
  const result = q ? await supportSearch(q) : { tickets: [], users: [], events: [] };
  const hasResults = result.tickets.length > 0 || result.users.length > 0 || result.events.length > 0;

  return (
    <AdminShell active="/admin/soporte" title="Soporte">
      <p className="mb-4 text-sm text-muted-foreground">
        Un cuadro de búsqueda: nombre de usuario, serial de ticket o título de evento. Para acciones (cambiar
        rol, forzar estado de un ticket, pausar un evento) usa la sección correspondiente.
      </p>

      <div className="mb-6">
        <TicketLookupForm defaultQuery={q ?? ""} basePath="/admin/soporte" />
      </div>

      {q && !hasResults && <p className="text-sm text-muted-foreground">Sin resultados para &quot;{q}&quot;.</p>}

      {result.tickets.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Tickets</h2>
          <div className="flex flex-col gap-1.5">
            {result.tickets.map((t) => (
              <Link key={t.id} href={`/admin/tickets?q=${t.serial}`}>
                <Card interactive>
                  <CardContent className="flex items-center justify-between gap-2 py-3">
                    <div className="flex items-center gap-2">
                      <Badge>{t.status}</Badge>
                      <span className="font-mono text-xs">{t.serial}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.eventTitle}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {result.users.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Usuarios</h2>
          <div className="flex flex-col gap-1.5">
            {result.users.map((u) => (
              <Link key={u.id} href={`/admin/usuarios?search=${encodeURIComponent(u.fullName ?? "")}`}>
                <Card interactive>
                  <CardContent className="flex items-center justify-between gap-2 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{u.role}</Badge>
                      <span className="text-sm">{u.fullName || "Sin nombre"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Desde {formatDateShort(u.createdAt)}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {result.events.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Eventos</h2>
          <div className="flex flex-col gap-1.5">
            {result.events.map((e) => (
              <Link key={e.id} href={`/admin/eventos?search=${encodeURIComponent(e.title)}`}>
                <Card interactive>
                  <CardContent className="flex items-center justify-between gap-2 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{e.status}</Badge>
                      <span className="text-sm">{e.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{e.organizerName ?? "—"}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AdminShell>
  );
}
