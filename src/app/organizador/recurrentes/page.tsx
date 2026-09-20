import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { Navbar, NavbarInner, NavbarBrand, NavbarActions } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-message";
import { getMyVenueSeries } from "@/lib/organizer";
import { getCategoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

const WEEKDAY_LABEL: Record<number, string> = { 0: "Dom", 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb" };

export default async function VenueSeriesListPage() {
  const series = await getMyVenueSeries();

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <NavbarBrand>Negocios recurrentes</NavbarBrand>
          </Link>
          <NavbarActions>
            <Button asChild size="sm">
              <Link href="/organizador/recurrentes/nuevo">
                <Plus className="size-4" /> Crear negocio
              </Link>
            </Button>
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Negocios recurrentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Para bares, discotecas o cualquier lugar que abre ciertos días fijos: configura el cover y los días una
            sola vez, y el evento de cada día se genera solo.
          </p>
        </header>

        {series.length === 0 ? (
          <EmptyState
            icon={<Store className="size-5" />}
            title="Sin negocios recurrentes"
            description="Créalo una vez y no vuelvas a crear un evento cada semana."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {series.map((s) => {
              const category = getCategoryMeta(s.category);
              const days = [...s.open_weekdays].sort().map((d) => WEEKDAY_LABEL[d]).join(" · ");
              return (
                <Link key={s.id} href={`/organizador/recurrentes/${s.id}`} className="block">
                  <Card interactive>
                    <CardContent className="flex items-center justify-between gap-3 py-4">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="brand">{category.label}</Badge>
                          <Badge variant={s.status === "activa" ? "success" : "neutral"}>
                            {s.status === "activa" ? "Activo" : "Pausado"}
                          </Badge>
                        </div>
                        <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {days} · {s.open_time}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
