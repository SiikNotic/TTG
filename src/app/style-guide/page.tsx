"use client";

import * as React from "react";
import { Search, Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, FieldHelp, FieldError } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarInner,
  NavbarLink,
  NavbarLinks,
  NavbarMobileMenu,
} from "@/components/ui/navbar";
import { Spinner, Skeleton, LoadingRow } from "@/components/ui/loading";
import { EmptyState, ErrorState } from "@/components/ui/state-message";
import { useToast } from "@/components/ui/toast";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-10 first:pt-0 last:border-b-0">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cnSwatch(className)} />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

function cnSwatch(bg: string) {
  return `h-14 w-full rounded-md border border-border ${bg}`;
}

export default function StyleGuidePage() {
  const { toast } = useToast();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarInner>
          <NavbarBrand>
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Ticket className="size-4" />
            </span>
            TTG
          </NavbarBrand>
          <NavbarLinks>
            <NavbarLink href="#" active>
              Descubrir
            </NavbarLink>
            <NavbarLink href="#">Organizador</NavbarLink>
            <NavbarLink href="#">Admin</NavbarLink>
          </NavbarLinks>
          <NavbarActions>
            <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
              Iniciar sesión
            </Button>
            <Button size="sm">Crear evento</Button>
            <NavbarMobileMenu>
              <NavbarLink href="#">Descubrir</NavbarLink>
              <NavbarLink href="#">Organizador</NavbarLink>
              <NavbarLink href="#">Admin</NavbarLink>
            </NavbarMobileMenu>
          </NavbarActions>
        </NavbarInner>
      </Navbar>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-10">
          <p className="text-sm font-medium text-primary">Sistema de diseño</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Fundaciones visuales de TTG
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Tokens y componentes base. Esta página existe solo para revisión interna del
            sistema, no es una pantalla final del producto.
          </p>
        </header>

        <Section title="Color" description="Escala de marca, neutrales y semánticos.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            <Swatch name="brand-500" className="bg-brand-500" />
            <Swatch name="brand-600" className="bg-brand-600" />
            <Swatch name="neutral-900" className="bg-neutral-900" />
            <Swatch name="neutral-500" className="bg-neutral-500" />
            <Swatch name="neutral-200" className="bg-neutral-200" />
            <Swatch name="neutral-50" className="bg-neutral-50" />
            <Swatch name="success-500" className="bg-success-500" />
            <Swatch name="warning-500" className="bg-warning-500" />
            <Swatch name="danger-500" className="bg-danger-500" />
            <Swatch name="info-500" className="bg-info-500" />
          </div>
        </Section>

        <Section title="Tipografía" description="Geist Sans, escala modular mobile-first.">
          <div className="space-y-3">
            <p className="text-5xl font-semibold tracking-tight">Título 5xl</p>
            <p className="text-4xl font-semibold tracking-tight">Título 4xl</p>
            <p className="text-3xl font-semibold">Título 3xl</p>
            <p className="text-2xl font-semibold">Título 2xl</p>
            <p className="text-xl font-medium">Título xl</p>
            <p className="text-lg font-medium">Título lg</p>
            <p className="text-base">Cuerpo base — texto de párrafo estándar.</p>
            <p className="text-sm text-muted-foreground">Texto sm — soporte y metadatos.</p>
            <p className="text-xs text-muted-foreground">Texto xs — etiquetas y leyendas.</p>
            <p className="font-mono text-sm">Geist Mono — para precios, fechas, códigos.</p>
          </div>
        </Section>

        <Section title="Radios y sombras">
          <div className="flex flex-wrap gap-4">
            <div className="flex size-20 items-center justify-center rounded-sm border border-border bg-surface text-xs text-muted-foreground">
              sm
            </div>
            <div className="flex size-20 items-center justify-center rounded-md border border-border bg-surface text-xs text-muted-foreground">
              md
            </div>
            <div className="flex size-20 items-center justify-center rounded-lg border border-border bg-surface text-xs text-muted-foreground">
              lg
            </div>
            <div className="flex size-20 items-center justify-center rounded-xl border border-border bg-surface text-xs text-muted-foreground">
              xl
            </div>
            <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-surface text-xs text-muted-foreground">
              2xl
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex size-20 items-center justify-center rounded-lg bg-surface text-xs text-muted-foreground shadow-xs">
              xs
            </div>
            <div className="flex size-20 items-center justify-center rounded-lg bg-surface text-xs text-muted-foreground shadow-sm">
              sm
            </div>
            <div className="flex size-20 items-center justify-center rounded-lg bg-surface text-xs text-muted-foreground shadow-md">
              md
            </div>
            <div className="flex size-20 items-center justify-center rounded-lg bg-surface text-xs text-muted-foreground shadow-lg">
              lg
            </div>
            <div className="flex size-20 items-center justify-center rounded-lg bg-surface text-xs text-muted-foreground shadow-xl">
              xl
            </div>
          </div>
        </Section>

        <Section title="Botones" description="Variantes, tamaños y estados.">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructivo</Button>
            <Button variant="link">Enlace</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeño</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">Grande</Button>
            <Button size="icon" variant="outline" aria-label="Buscar">
              <Search />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button disabled>Deshabilitado</Button>
            <Button loading>Cargando</Button>
          </div>
        </Section>

        <Section title="Inputs y selects">
          <div className="grid max-w-md gap-5">
            <div className="grid gap-1.5">
              <Label htmlFor="sg-name">Nombre del evento</Label>
              <Input id="sg-name" placeholder="Ej. Feria de música independiente" />
              <FieldHelp>Así aparecerá públicamente.</FieldHelp>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sg-search">Buscar</Label>
              <Input id="sg-search" placeholder="Buscar eventos, lugares..." startIcon={<Search />} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sg-email">Correo</Label>
              <Input id="sg-email" type="email" invalid defaultValue="correo-invalido" />
              <FieldError>Ingresa un correo válido.</FieldError>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sg-category">Categoría</Label>
              <Select>
                <SelectTrigger id="sg-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Música</SelectItem>
                  <SelectItem value="tech">Tecnología</SelectItem>
                  <SelectItem value="sports">Deportes</SelectItem>
                  <SelectItem value="art">Arte y cultura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">Borrador</Badge>
            <Badge variant="brand">Destacado</Badge>
            <Badge variant="success">Confirmado</Badge>
            <Badge variant="warning">Pendiente</Badge>
            <Badge variant="danger">Cancelado</Badge>
            <Badge variant="outline">Nuevo</Badge>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card interactive>
              <CardHeader>
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant="brand">Música</Badge>
                  <span className="text-xs text-muted-foreground">Vie 24 oct</span>
                </div>
                <CardTitle>Noche acústica en La Terraza</CardTitle>
                <CardDescription>Bogotá, Colombia</CardDescription>
              </CardHeader>
              <CardFooter>
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">A 2.3 km</span>
                <Button size="sm" variant="ghost" className="ml-auto">
                  Ver más <ArrowRight className="size-4" />
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">
                  Card simple sin interacción, para contenido informativo.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="upcoming" className="max-w-md">
            <TabsList>
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="past">Pasados</TabsTrigger>
              <TabsTrigger value="drafts">Borradores</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <p className="text-sm text-muted-foreground">Eventos próximos del organizador.</p>
            </TabsContent>
            <TabsContent value="past">
              <p className="text-sm text-muted-foreground">Eventos ya finalizados.</p>
            </TabsContent>
            <TabsContent value="drafts">
              <p className="text-sm text-muted-foreground">Borradores sin publicar.</p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Modal">
          <Modal>
            <ModalTrigger asChild>
              <Button variant="outline">Abrir modal</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Cancelar publicación</ModalTitle>
                <ModalDescription>
                  Esta acción quitará el evento de la vista pública. Podrás volver a
                  publicarlo cuando quieras.
                </ModalDescription>
              </ModalHeader>
              <ModalFooter>
                <Button variant="ghost">Volver</Button>
                <Button variant="destructive">Cancelar publicación</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Section>

        <Section title="Toasts">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast({ title: "Evento publicado", variant: "success" })}
            >
              Éxito
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast({ title: "No se pudo guardar", description: "Intenta de nuevo.", variant: "error" })
              }
            >
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: "Quedan pocos cupos", variant: "warning" })}
            >
              Advertencia
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ title: "Nueva actualización disponible", variant: "info" })}
            >
              Info
            </Button>
          </div>
        </Section>

        <Section title="Loading, empty y error">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Spinner />
                <span className="text-sm text-muted-foreground">Spinner</span>
              </div>
              <LoadingRow />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Button
                size="sm"
                variant="secondary"
                loading={loadingDemo}
                onClick={() => {
                  setLoadingDemo(true);
                  setTimeout(() => setLoadingDemo(false), 1500);
                }}
              >
                Probar botón cargando
              </Button>
            </div>
            <div className="space-y-4">
              <EmptyState
                icon={<Calendar className="size-5" />}
                title="Sin eventos todavía"
                description="Cuando crees tu primer evento, aparecerá aquí."
                action={{ label: "Crear evento" }}
              />
            </div>
          </div>
          <div className="mt-6">
            <ErrorState
              title="No pudimos cargar los eventos"
              description="Revisa tu conexión e intenta nuevamente."
              action={{ label: "Reintentar" }}
            />
          </div>
        </Section>
      </main>
    </div>
  );
}
