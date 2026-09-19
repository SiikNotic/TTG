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
 * Categorías de evento. Compartidas entre la demo pública (ETAPA 3) y el
 * área de organizador (ETAPA 5) — coinciden 1:1 con el enum
 * `event_category` de la base de datos.
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
