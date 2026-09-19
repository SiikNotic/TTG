export interface EventRules {
  idRequired: boolean;
  invitationCode: boolean;
  studentsOnly: boolean;
  membersOnly: boolean;
  promoCode: boolean;
  custom: string[];
}

export const DEFAULT_RULES: EventRules = {
  idRequired: false,
  invitationCode: false,
  studentsOnly: false,
  membersOnly: false,
  promoCode: false,
  custom: [],
};

/** Los datos vienen de una columna jsonb: nunca confiar en su forma. */
export function parseRules(json: unknown): EventRules {
  if (!json || typeof json !== "object") return { ...DEFAULT_RULES };
  const r = json as Partial<EventRules>;
  return {
    idRequired: Boolean(r.idRequired),
    invitationCode: Boolean(r.invitationCode),
    studentsOnly: Boolean(r.studentsOnly),
    membersOnly: Boolean(r.membersOnly),
    promoCode: Boolean(r.promoCode),
    custom: Array.isArray(r.custom)
      ? r.custom.filter((c): c is string => typeof c === "string" && c.trim().length > 0).slice(0, 15)
      : [],
  };
}

export const RULE_TOGGLES: { key: keyof Omit<EventRules, "custom">; label: string }[] = [
  { key: "idRequired", label: "Se requiere identificación" },
  { key: "invitationCode", label: "Requiere código de invitación" },
  { key: "studentsOnly", label: "Solo estudiantes" },
  { key: "membersOnly", label: "Solo miembros" },
  { key: "promoCode", label: "Requiere código promocional" },
];

export function ageRestrictionLabel(minAge: number | null): string {
  if (!minAge) return "Todas las edades";
  if (minAge === 18) return "+18";
  if (minAge === 21) return "+21";
  return `Edad mínima: ${minAge} años`;
}

/** Lista de reglas en texto plano, lista para mostrar antes de la compra. */
export function ruleDescriptions(rules: EventRules, minAge: number | null): string[] {
  const list: string[] = [ageRestrictionLabel(minAge)];
  for (const { key, label } of RULE_TOGGLES) {
    if (rules[key]) list.push(label);
  }
  list.push(...rules.custom);
  return list;
}
