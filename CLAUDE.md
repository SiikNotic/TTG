# TTG — Design System Rules (for Figma MCP integration)

TTG is a Next.js 15 (App Router) ticketing marketplace. This doc maps the
codebase's design system so Figma designs can be translated into code that
matches existing conventions instead of introducing parallel patterns.

## 1. Token Definitions

**Single source of truth:** `src/app/globals.css`, using Tailwind v4's CSS-native
`@theme` block (no `tailwind.config.js` — Tailwind v4 is config-less by default
and this project doesn't add one).

Three token layers:

1. **Primitive scales** — raw values, theme-independent. Never used directly in
   components; always referenced through a semantic token.
   ```css
   @theme {
     --color-brand-50: #f2f2ff;   /* ... through */
     --color-brand-950: #1b1750;
     --color-neutral-0: #ffffff;  /* ... through */
     --color-neutral-950: #0d0d10;
     --color-success-500: #16a34a;
     --color-warning-500: #d97706;
     --color-danger-500: #dc2626;
     --color-info-500: #2563eb;
   }
   ```
2. **Semantic tokens** — light values in `:root`, dark values in `.dark`, both
   re-exported into `@theme` so Tailwind generates utilities (`bg-primary`,
   `text-foreground`, `border-border`, etc.):
   ```css
   :root {
     --background: var(--color-neutral-0);
     --foreground: var(--color-neutral-900);
     --primary: var(--color-brand-500);
     --primary-hover: var(--color-brand-600);
     --border: var(--color-neutral-200);
     --ring: var(--color-brand-400);
     /* ... */
   }
   .dark { --background: var(--color-neutral-950); /* ... */ }
   ```
   Rule enforced by a comment at the top of the file: *"No definir colores,
   radios ni sombras 'sueltos' en componentes: siempre referenciar un token."*
   (Don't hardcode colors/radii/shadows in components — always reference a token.)
3. **Non-color scales** — also theme tokens, also referenced by utility classes:
   - Typography: `--text-xs` … `--text-5xl` (each with a paired `--text-*--line-height`)
   - Radius: `--radius-xs` (4px) → `--radius-2xl` (28px)
   - Shadow: `--shadow-xs` → `--shadow-xl` (deliberately subtle, "nunca duras")
   - Motion: `--ease-standard`, `--ease-emphasized`, `--duration-fast` (120ms),
     `--duration-base` (180ms), `--duration-slow` (280ms)

**No token build/transform pipeline** (no Style Dictionary, no Figma Tokens
plugin JSON). Tokens are hand-written CSS custom properties. Any Figma
variable → code mapping should target this file directly, matching existing
names rather than inventing new ones.

**Dark mode:** class-based (`.dark` on an ancestor), not yet toggled anywhere
in the app UI, but fully defined — treat it as a first-class target when
translating a Figma frame that has light/dark variants.

## 2. Component Library

- **Location:** `src/components/ui/` — the primitive/design-system layer.
  `src/components/{auth,discover,organizer,admin,realtime}/` hold
  feature-specific components built on top of the `ui/` primitives.
- **No Storybook, no component docs site.** The closest thing is a live
  showcase page at `src/app/style-guide/page.tsx` (`/style-guide` route) that
  renders every `ui/` primitive with its variants — check it first when
  unsure how a component should look/behave.
- **Architecture pattern**, consistent across every file in `ui/`:
  - `React.forwardRef` for anything that wraps a native element or a Radix
    primitive (needed for `asChild`/form libraries/focus management).
  - Variants via `class-variance-authority` (`cva`) when a component has
    a `variant`/`size` axis (`button.tsx`, `badge.tsx`). Plain prop + `cn()`
    branching for simpler on/off styling (`card.tsx`'s `interactive` prop).
  - Every component accepts `className` and merges it **last** via `cn()`,
    so callers can override.
  - Compound components are split into named parts and exported together,
    e.g. `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
    `CardFooter` from `card.tsx`; `Navbar`, `NavbarInner`, `NavbarBrand`,
    `NavbarLinks`, `NavbarLink`, `NavbarActions`, `NavbarMobileMenu` from
    `navbar.tsx`.

Example — the canonical shape to follow for a new primitive
(`src/components/ui/button.tsx`):
```tsx
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "transition-colors duration-fast ease-standard",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:opacity-90 shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-surface-hover active:opacity-90",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-hover",
        ghost: "bg-transparent text-foreground hover:bg-surface-hover",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90 shadow-xs",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);
```
Icons dropped as children automatically get `size-4 shrink-0` via the
`[&_svg]:size-4` selector — don't hand-size icons inside a `Button`.

**Current `ui/` inventory** (treat as the palette of primitives to reuse
before creating anything new): `button`, `input`, `textarea`, `label`,
`select` (Radix Select wrapper), `card`, `badge`, `modal` (Radix Dialog
wrapper), `tabs` (Radix Tabs wrapper), `toast` (Radix Toast wrapper +
`ToastProvider`), `loading`, `state-message` (`EmptyState`/error states),
`navbar`, `brand-mark`.

## 3. Frameworks & Libraries

- **Framework:** Next.js 15, App Router, React 19. Server Components by
  default; `"use client"` only on interactive leaves (forms, the mobile menu,
  Radix-driven widgets). Server Actions (`useActionState`) for all mutations —
  no client-side fetch/axios layer.
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`,
  `@tailwindcss/postcss` in `postcss.config`), no `tailwind.config.*` file —
  theme lives entirely in the `@theme` CSS block described above.
  `tailwindcss-animate` plugin supplies `animate-in`/`animate-out`/
  `fade-in-0`/`slide-in-from-*`/`zoom-in-95` utilities, used for all
  Radix open/close transitions.
- **Primitive/headless components:** Radix UI (`@radix-ui/react-dialog`,
  `-select`, `-tabs`, `-toast`, `-label`, `-slot`). Every Radix primitive in
  this repo is wrapped once in `src/components/ui/` and consumed through that
  wrapper — never import `@radix-ui/react-*` directly in a feature component.
- **Variant/class utilities:** `class-variance-authority` (`cva`) for variant
  props, `clsx` + `tailwind-merge` combined into the `cn()` helper
  (`src/lib/utils.ts`) for conditional/overridable className composition.
  `cn()` is the only accepted way to merge classNames in this codebase.
- **Icons:** `lucide-react` (see §5).
- **Fonts:** `geist` package — `GeistSans`/`GeistMono` from `geist/font/sans`
  and `geist/font/mono`, applied as CSS variables on `<html>` in
  `src/app/layout.tsx` (`className={`${GeistSans.variable} ${GeistMono.variable}`}`)
  and consumed by `--font-sans`/`--font-mono` in the theme block. Not Google
  Fonts, not `next/font/google`.
- **Build/bundler:** Next.js's own build (Turbopack/webpack via `next build`),
  no separate bundler config.
- **Backend/data:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) for
  auth/DB/storage/realtime, Stripe for payments — not relevant to visual
  translation but explains why so many components are `async` Server
  Components fetching data directly.

## 4. Asset Management

- **User-uploaded images** (event covers, organizer logos, avatars) live in
  **Supabase Storage** and are referenced by full HTTPS URL stored in the DB
  (e.g. `event.cover_image_url`). `next/image` is configured in
  `next.config.ts` to allow that host:
  ```ts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  ```
- **No static `/public` image library and no CDN config beyond Next's own
  image optimizer** — every raster image in the product is either a
  Supabase-hosted upload or absent (falls back to a generated placeholder,
  see below).
- **Fallback-when-no-image pattern:** `src/components/discover/event-cover.tsx`
  renders a category-colored gradient placeholder; `event-thumbnail.tsx`
  decides between the real photo and that placeholder:
  ```tsx
  function EventThumbnail({ category, coverImageUrl, alt, className, iconClassName, sizes, priority }) {
    if (!coverImageUrl) {
      return <EventCover category={category} className={className} iconClassName={iconClassName} />;
    }
    return (
      <div className={cn("relative overflow-hidden bg-neutral-900", className)}>
        <Image src={coverImageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  ```
  Any Figma frame with an event/venue photo should map to `EventThumbnail`,
  not a raw `next/image`, so the no-photo state stays covered.
- Every `<Image fill>` usage passes an explicit `sizes` for correct responsive
  loading — carry this through when generating new image usages.

## 5. Icon System

- **Library:** `lucide-react` exclusively. No custom SVG icon set, no icon
  sprite sheet, no `src/components/icons/`.
- **Import pattern:** named import directly from `lucide-react` per file,
  e.g. `import { Menu, X } from "lucide-react"`, `import { CalendarDays,
  MapPin, Ticket as TicketIcon } from "lucide-react"` — aliasing when a name
  collides with a local type/component (`Ticket` the icon vs. a `Ticket`
  domain type).
- **Sizing convention:** Tailwind size utilities on the icon itself —
  `size-4` (16px, the default/most common, matches `Button`'s built-in
  `[&_svg]:size-4`), `size-5` for nav/trigger icons, `size-3.5` for inline
  metadata icons (date/location rows on cards), up to `size-8`/`size-10` for
  large empty-state icons. Always pair with `shrink-0` inside a flex row so
  the icon doesn't compress next to wrapping text.
- **Color:** icons inherit `currentColor` (no fill/stroke overrides) and get
  their color from the surrounding text color utility (`text-muted-foreground`,
  `text-primary`, `text-white`, etc.) — never hardcode an icon color directly.
- No icon naming convention beyond Lucide's own PascalCase component names.

## 6. Styling Approach

- **Methodology:** utility-first Tailwind, no CSS Modules, no
  styled-components/emotion, no `className` string constants file. One
  global stylesheet (`src/app/globals.css`) for tokens + a handful of true
  globals (focus ring, selection color, print rules); everything else is
  inline Tailwind classes composed through `cn()`.
- **Global styles worth knowing:**
  - Universal `border-color: var(--color-border)` reset so bare `border`
    utilities don't need a color suffix.
  - Consistent focus ring via `:focus-visible` (2px solid `--color-ring`,
    2px offset) — don't hand-roll a different focus treatment.
  - `prefers-reduced-motion: reduce` globally collapses all
    animation/transition durations to ~0 — any new animation utility
    automatically respects this, nothing extra to opt in.
  - A `@media print` block strips the app down to plain white background
    for the ticket-PDF-via-browser-print flow (`/tickets/[ticketId]`) — don't
    treat this as a general print stylesheet, it's narrowly scoped.
- **Responsive implementation:** mobile-first Tailwind breakpoints (`sm:`,
  `md:`, `lg:`) applied directly on elements — no separate mobile
  components/layouts. Common patterns already established:
  - Nav links collapse behind `NavbarMobileMenu` (a bottom-sheet Radix Dialog,
    see `src/components/ui/navbar.tsx`) below `md:`, full inline `NavbarLinks`
    row above it.
  - Horizontal-scroll rows (`-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0
    sm:px-0`) for filter pills / featured-event carousels instead of wrapping
    or a separate mobile layout.
  - Grids step up column count with breakpoint (`grid-cols-1 sm:grid-cols-2
    lg:grid-cols-3`) for event listing grids.
- **Motion/microinteractions:** always via the theme's `duration-*`/`ease-*`
  tokens plus `tailwindcss-animate`'s `data-[state=open]:animate-in` /
  `data-[state=closed]:animate-out` pattern on Radix primitives — never raw
  `transition: all` or ad-hoc keyframes.

## 7. Project Structure

```
src/
  app/                     # Next.js App Router — one folder per route
    (public pages)         # /, /eventos/[slug], /comprar/[ticketTypeId], /ordenes/[orderId], /tickets/[ticketId]
    iniciar-sesion/, registro/, recuperar-contrasena/, restablecer-contrasena/,
    verificar-email/, verificar-mfa/, auth/, cuenta/        # auth + account
    organizador/            # organizer dashboard (role-gated)
      eventos/, pagos/, finanzas/, perfil/, validar/, recurrentes/
    admin/                  # admin dashboard (role-gated)
      usuarios/, organizadores/, eventos/, tickets/, transacciones/, ...
    api/                    # route handlers: webhooks/stripe, cron/generate-venue-events
    style-guide/            # ui/ primitives showcase — check before building new UI
    globals.css             # design tokens (source of truth)
    layout.tsx               # root layout: fonts + ToastProvider
  components/
    ui/                     # design-system primitives (framework-agnostic look)
    auth/                   # auth-specific composed components
    discover/                # public discovery/browse composed components
    organizer/               # organizer-dashboard composed components
    admin/                   # admin-dashboard composed components
    realtime/                # Supabase Realtime wiring components
  lib/                      # data access, server actions, domain logic — no UI
    actions/                 # Server Actions grouped by domain
    supabase/, stripe/, paypal/   # external service clients
```

**Route ↔ page-component pattern:** every route's `page.tsx` is an `async`
Server Component that fetches data via a `src/lib/*.ts` accessor and passes
it straight into presentational components; interactive pieces (forms,
buttons that trigger Server Actions) are split into a co-located
`"use client"` file next to the page (e.g. `page.tsx` +
`order-actions.tsx`, `page.tsx` + `reserve-form.tsx`). When translating a
Figma page into code, follow this split: static/layout markup goes in
`page.tsx`, anything stateful/interactive becomes its own client component
file beside it.

**Feature-composed components live one level above `ui/`**, named after what
they render (`event-card.tsx`, `event-thumbnail.tsx`, `event-cover.tsx`,
`category-filter.tsx`, `filters-bar.tsx`), and are themselves built purely
from `ui/` primitives + Tailwind — they don't introduce new one-off styling
primitives.

## Practical checklist when turning a Figma frame into code

1. Map every color/radius/shadow/spacing-scale value in the frame to an
   existing token in `globals.css` §1 before writing any class — don't
   introduce a new hex value or arbitrary Tailwind value (`bg-[#...]`) if a
   token already covers it.
2. Check `/style-guide` and `src/components/ui/` for an existing primitive
   that already matches the frame's component (button, badge, card, select,
   tabs, modal, toast) before building a new one.
3. Reuse `EventThumbnail`/`EventCover` for any photo-or-placeholder image
   slot; reuse `Badge` variants for status pills; reuse `Card`
   (+ `interactive` prop for hoverable/clickable cards).
4. New icons come from `lucide-react` only, sized with `size-*` + `shrink-0`,
   colored via the surrounding text color.
5. Build mobile-first; collapse secondary nav into `NavbarMobileMenu`-style
   sheets rather than a bespoke mobile layout; use existing breakpoint
   patterns (`sm:`/`md:`/`lg:`) rather than introducing new ones.
6. Any open/close or hover microinteraction uses the `duration-*`/`ease-*`
   tokens and, for Radix-driven components, the `animate-in`/`animate-out`
   data-state pattern already in use.
