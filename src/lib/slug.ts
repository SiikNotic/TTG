export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function slugWithSuffix(value: string) {
  const base = slugify(value) || "evento";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
