"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    />
  );
}

function NavbarInner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6",
        className
      )}
      {...props}
    />
  );
}

function NavbarBrand({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-2 text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function NavbarLinks({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav
      className={cn("hidden items-center gap-1 md:flex", className)}
      {...props}
    />
  );
}

const NavbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground",
      "transition-all duration-base ease-standard hover:-translate-y-px hover:bg-surface-hover hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active && "text-foreground",
      className
    )}
    {...props}
  />
));
NavbarLink.displayName = "NavbarLink";

function NavbarActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

interface NavbarMobileMenuProps {
  children: React.ReactNode;
  triggerLabel?: string;
}

function NavbarMobileMenu({ children, triggerLabel = "Abrir menú" }: NavbarMobileMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-md text-foreground md:hidden",
          "transition-colors duration-fast hover:bg-surface-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label={triggerLabel}
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-neutral-950/55 backdrop-blur-[2px] md:hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-base ease-standard"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col gap-1 rounded-t-2xl bg-surface-elevated p-4 shadow-xl md:hidden",
            "pb-[max(1rem,env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:fade-out-0",
            "duration-slow ease-emphasized"
          )}
        >
          <div className="mx-auto mb-1 h-1 w-9 shrink-0 rounded-full bg-border" aria-hidden="true" />
          <div className="mb-2 flex items-center justify-between">
            <DialogPrimitive.Title className="text-sm font-medium text-muted-foreground">
              Menú
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full text-foreground",
                "transition-colors duration-fast hover:bg-surface-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <div onClick={() => setOpen(false)} className="flex flex-col gap-1 overflow-y-auto">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export {
  Navbar,
  NavbarInner,
  NavbarBrand,
  NavbarLinks,
  NavbarLink,
  NavbarActions,
  NavbarMobileMenu,
};
