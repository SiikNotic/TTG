"use client";

import { CATEGORIES, type EventCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  value: EventCategory | "todas";
  onChange: (value: EventCategory | "todas") => void;
}

function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      style={{ scrollbarWidth: "none" }}
    >
      <Pill active={value === "todas"} onClick={() => onChange("todas")}>
        Todas
      </Pill>
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <Pill key={category.value} active={value === category.value} onClick={() => onChange(category.value)}>
            <Icon className="size-3.5" />
            {category.label}
          </Pill>
        );
      })}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-strong bg-surface text-foreground hover:bg-surface-hover"
      )}
    >
      {children}
    </button>
  );
}

export { CategoryFilter };
