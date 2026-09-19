import {
  Music,
  GraduationCap,
  Trophy,
  Drama,
  PartyPopper,
  Users,
  UtensilsCrossed,
  Church,
  HeartHandshake,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Todo el contenido de este archivo es DATA DE DEMOSTRACIÓN.
 * Nombres de eventos, organizadores, lugares y precios son ficticios
 * y no representan eventos reales. Sirven solo para construir y
 * validar la experiencia de descubrimiento pública.
 */

export type EventCategory =
  | "musica"
  | "escuelas"
  | "deportes"
  | "teatro"
  | "fiestas"
  | "familia"
  | "gastronomia"
  | "religioso"
  | "comunidad"
  | "otros";

export type EventStatus = "disponible" | "agotado" | "cancelado" | "finalizado";

export interface CategoryMeta {
  value: EventCategory;
  label: string;
  icon: LucideIcon;
  /** Par de tokens de color (from, to) usados para la portada de gradiente. */
  gradient: [string, string];
}

export const CATEGORIES: CategoryMeta[] = [
  { value: "musica", label: "Música", icon: Music, gradient: ["--color-brand-500", "--color-brand-800"] },
  { value: "escuelas", label: "Escuelas", icon: GraduationCap, gradient: ["--color-info-500", "--color-brand-700"] },
  { value: "deportes", label: "Deportes", icon: Trophy, gradient: ["--color-success-500", "--color-brand-800"] },
  { value: "teatro", label: "Teatro", icon: Drama, gradient: ["--color-brand-700", "--color-neutral-900"] },
  { value: "fiestas", label: "Fiestas", icon: PartyPopper, gradient: ["--color-brand-400", "--color-danger-500"] },
  { value: "familia", label: "Familia", icon: Users, gradient: ["--color-warning-500", "--color-brand-600"] },
  { value: "gastronomia", label: "Gastronomía", icon: UtensilsCrossed, gradient: ["--color-warning-600", "--color-neutral-900"] },
  { value: "religioso", label: "Religioso", icon: Church, gradient: ["--color-neutral-700", "--color-brand-900"] },
  { value: "comunidad", label: "Comunidad", icon: HeartHandshake, gradient: ["--color-info-600", "--color-success-600"] },
  { value: "otros", label: "Otros", icon: Tag, gradient: ["--color-neutral-600", "--color-neutral-900"] },
];

const FALLBACK_CATEGORY = CATEGORIES[CATEGORIES.length - 1]!;

export function getCategoryMeta(category: EventCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.value === category) ?? FALLBACK_CATEGORY;
}

export interface Organizer {
  id: string;
  name: string;
  initials: string;
  verified?: boolean;
  eventsCount: number;
  bio: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  featured?: boolean;
  lowStock?: boolean;
  dateStart: string;
  dateEnd?: string;
  venueName: string;
  address: string;
  city: string;
  distanceKm?: number;
  priceFrom: number | null;
  ageRestriction?: string;
  description: string;
  rules: string[];
  organizer: Organizer;
}

const organizers = {
  circuloSonoro: {
    id: "org-circulo-sonoro",
    name: "Círculo Sonoro (demo)",
    initials: "CS",
    verified: true,
    eventsCount: 24,
    bio: "Colectivo independiente dedicado a la música en vivo en espacios íntimos. Perfil de demostración.",
  },
  redUniversitaria: {
    id: "org-red-universitaria",
    name: "Red Universitaria de Ciencias (demo)",
    initials: "RU",
    verified: true,
    eventsCount: 12,
    bio: "Organiza encuentros académicos y ferias abiertas al público. Perfil de demostración.",
  },
  ligaBarrial: {
    id: "org-liga-barrial",
    name: "Liga Barrial Deportiva (demo)",
    initials: "LB",
    eventsCount: 8,
    bio: "Promueve torneos comunitarios de fútbol y baloncesto. Perfil de demostración.",
  },
  teatroDelRio: {
    id: "org-teatro-del-rio",
    name: "Teatro del Río (demo)",
    initials: "TR",
    verified: true,
    eventsCount: 31,
    bio: "Sala independiente de artes escénicas con más de una década de trayectoria. Perfil de demostración.",
  },
  clubNocturno: {
    id: "org-club-nocturno",
    name: "Club Nocturno Aurora (demo)",
    initials: "CA",
    eventsCount: 15,
    bio: "Producción de fiestas temáticas y música electrónica. Perfil de demostración.",
  },
  fundacionCrecer: {
    id: "org-fundacion-crecer",
    name: "Fundación Crecer en Familia (demo)",
    initials: "FC",
    verified: true,
    eventsCount: 6,
    bio: "Actividades gratuitas para familias en espacios públicos. Perfil de demostración.",
  },
  rutaSabores: {
    id: "org-ruta-sabores",
    name: "Ruta de Sabores (demo)",
    initials: "RS",
    eventsCount: 9,
    bio: "Curaduría de experiencias gastronómicas locales. Perfil de demostración.",
  },
  parroquiaCentral: {
    id: "org-parroquia-central",
    name: "Parroquia Central (demo)",
    initials: "PC",
    eventsCount: 4,
    bio: "Encuentros comunitarios y celebraciones abiertas a la comunidad. Perfil de demostración.",
  },
  mesaVecinal: {
    id: "org-mesa-vecinal",
    name: "Mesa Vecinal (demo)",
    initials: "MV",
    eventsCount: 5,
    bio: "Iniciativas de organización comunitaria de barrio. Perfil de demostración.",
  },
};

const genericRules = [
  "El ingreso queda sujeto a la capacidad del lugar.",
  "No se permite el reingreso una vez abandonado el evento.",
  "La organización puede modificar la programación sin previo aviso.",
];

function inDays(days: number, hour = 20, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const EVENTS: EventRecord[] = [
  {
    id: "evt-1",
    slug: "noche-acustica-terraza",
    title: "Noche acústica en La Terraza (demo)",
    category: "musica",
    status: "disponible",
    featured: true,
    dateStart: inDays(6, 19, 30),
    venueName: "La Terraza Cultural (demo)",
    address: "Calle 45 #12-30",
    city: "Bogotá",
    distanceKm: 2.3,
    priceFrom: 45000,
    description:
      "Un set íntimo de artistas emergentes en formato acústico, en un espacio al aire libre con capacidad limitada. Evento de demostración.",
    rules: [...genericRules, "Evento al aire libre: se recomienda ropa acorde al clima."],
    organizer: organizers.circuloSonoro,
  },
  {
    id: "evt-2",
    slug: "feria-ciencias-abierta",
    title: "Feria de Ciencias Abierta (demo)",
    category: "escuelas",
    status: "disponible",
    featured: true,
    dateStart: inDays(10, 9, 0),
    venueName: "Campus Norte (demo)",
    address: "Av. 68 #90-21",
    city: "Bogotá",
    distanceKm: 5.1,
    priceFrom: 0,
    description:
      "Muestra de proyectos científicos estudiantiles abierta al público general, con talleres cortos para todas las edades. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.redUniversitaria,
  },
  {
    id: "evt-3",
    slug: "torneo-barrial-futbol-5",
    title: "Torneo Barrial de Fútbol 5 (demo)",
    category: "deportes",
    status: "disponible",
    lowStock: true,
    dateStart: inDays(4, 8, 0),
    venueName: "Polideportivo San Martín (demo)",
    address: "Cra 30 #5-10",
    city: "Medellín",
    distanceKm: 8.7,
    priceFrom: 15000,
    description:
      "Torneo comunitario por equipos, con premiación simbólica y venta de comida local durante la jornada. Evento de demostración.",
    rules: [...genericRules, "Uso obligatorio de calzado deportivo apto para cancha sintética."],
    organizer: organizers.ligaBarrial,
  },
  {
    id: "evt-4",
    slug: "la-ultima-carta-obra",
    title: "La Última Carta — obra de teatro (demo)",
    category: "teatro",
    status: "disponible",
    featured: true,
    dateStart: inDays(8, 20, 0),
    venueName: "Teatro del Río (demo)",
    address: "Calle 12 #4-56",
    city: "Cali",
    distanceKm: 3.4,
    priceFrom: 38000,
    ageRestriction: "+14",
    description:
      "Drama contemporáneo sobre memoria y familia, puesta en escena con elenco local. Evento de demostración.",
    rules: [...genericRules, "Contenido con temáticas sensibles, se recomienda discreción para menores."],
    organizer: organizers.teatroDelRio,
  },
  {
    id: "evt-5",
    slug: "aurora-noche-electronica",
    title: "Aurora — Noche Electrónica (demo)",
    category: "fiestas",
    status: "agotado",
    dateStart: inDays(3, 22, 0),
    venueName: "Club Aurora (demo)",
    address: "Cra 15 #93-40",
    city: "Bogotá",
    distanceKm: 4.0,
    priceFrom: 60000,
    ageRestriction: "+18",
    description:
      "Line-up de DJs locales con producción visual propia. Entradas agotadas para esta fecha. Evento de demostración.",
    rules: [...genericRules, "Ingreso exclusivo para mayores de edad con documento de identidad."],
    organizer: organizers.clubNocturno,
  },
  {
    id: "evt-6",
    slug: "tarde-de-juegos-familiares",
    title: "Tarde de Juegos Familiares (demo)",
    category: "familia",
    status: "disponible",
    dateStart: inDays(5, 15, 0),
    venueName: "Parque Central (demo)",
    address: "Cra 7 #22-15",
    city: "Bogotá",
    distanceKm: 1.2,
    priceFrom: 0,
    description:
      "Actividades lúdicas gratuitas para niños y familias, con talleres de arte y juegos tradicionales. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.fundacionCrecer,
  },
  {
    id: "evt-7",
    slug: "ruta-sabores-callejeros",
    title: "Ruta de Sabores Callejeros (demo)",
    category: "gastronomia",
    status: "disponible",
    featured: true,
    dateStart: inDays(7, 12, 0),
    venueName: "Plazoleta Gastronómica (demo)",
    address: "Calle 70 #10-05",
    city: "Barranquilla",
    distanceKm: 6.6,
    priceFrom: 25000,
    description:
      "Recorrido curado por cocinas locales independientes, con degustaciones incluidas en la entrada. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.rutaSabores,
  },
  {
    id: "evt-8",
    slug: "encuentro-comunitario-fe",
    title: "Encuentro Comunitario de Fe (demo)",
    category: "religioso",
    status: "disponible",
    dateStart: inDays(9, 18, 0),
    venueName: "Parroquia Central (demo)",
    address: "Cra 5 #33-12",
    city: "Cali",
    distanceKm: 2.9,
    priceFrom: 0,
    description:
      "Celebración abierta a la comunidad con música coral y espacio de encuentro posterior. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.parroquiaCentral,
  },
  {
    id: "evt-9",
    slug: "asamblea-vecinal-abierta",
    title: "Asamblea Vecinal Abierta (demo)",
    category: "comunidad",
    status: "disponible",
    dateStart: inDays(2, 18, 30),
    venueName: "Salón Comunal El Prado (demo)",
    address: "Calle 80 #45-20",
    city: "Medellín",
    distanceKm: 3.8,
    priceFrom: 0,
    description:
      "Espacio abierto de participación ciudadana sobre proyectos del barrio. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.mesaVecinal,
  },
  {
    id: "evt-10",
    slug: "mercado-independiente-otono",
    title: "Mercado Independiente (demo)",
    category: "otros",
    status: "disponible",
    dateStart: inDays(12, 10, 0),
    venueName: "Bodega Cultural 47 (demo)",
    address: "Cra 24 #56-70",
    city: "Bogotá",
    distanceKm: 4.5,
    priceFrom: 0,
    description:
      "Feria de emprendimientos locales: diseño, ilustración y objetos hechos a mano. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.mesaVecinal,
  },
  {
    id: "evt-11",
    slug: "sinfonica-bajo-las-estrellas",
    title: "Sinfónica Bajo las Estrellas (demo)",
    category: "musica",
    status: "cancelado",
    dateStart: inDays(15, 19, 0),
    venueName: "Anfiteatro Municipal (demo)",
    address: "Av. Circunvalar #1-01",
    city: "Bogotá",
    distanceKm: 7.2,
    priceFrom: 30000,
    description:
      "Concierto sinfónico al aire libre. Este evento fue cancelado por la organización. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.circuloSonoro,
  },
  {
    id: "evt-12",
    slug: "coloquio-historia-local",
    title: "Coloquio de Historia Local (demo)",
    category: "escuelas",
    status: "finalizado",
    dateStart: inDays(-5, 17, 0),
    venueName: "Biblioteca Pública (demo)",
    address: "Calle 19 #8-40",
    city: "Bogotá",
    distanceKm: 2.0,
    priceFrom: 0,
    description:
      "Charla abierta sobre la historia del barrio con archivo fotográfico. Este evento ya finalizó. Evento de demostración.",
    rules: genericRules,
    organizer: organizers.redUniversitaria,
  },
];

export function getFeaturedEvents() {
  return EVENTS.filter((e) => e.featured);
}

export function getUpcomingEvents() {
  return [...EVENTS].sort(
    (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
  );
}

export function getEventBySlug(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}

export const CITIES = ["Bogotá", "Medellín", "Cali", "Barranquilla"] as const;
