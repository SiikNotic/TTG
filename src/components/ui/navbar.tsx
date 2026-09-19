"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md",
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
        "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6",
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
      "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:text-foreground hover:bg-surface-hover",
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
            "fixed inset-0 z-50 bg-neutral-950/50 md:hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col gap-1 bg-surface-elevated p-4 shadow-xl md:hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
            "duration-base ease-standard"
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <DialogPrimitive.Title className="text-sm font-medium text-muted-foreground">
              Menú
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md text-foreground",
                "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Cerrar menú"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <div onClick={() => setOpen(false)} className="flex flex-col gap-1">
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
