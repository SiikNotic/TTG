import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const baseInputClasses = [
  "flex h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground",
  "placeholder:text-muted-foreground",
  "transition-colors duration-fast ease-standard",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
].join(" ");

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, startIcon, endIcon, disabled, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative">
          {startIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
              {startIcon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            className={cn(baseInputClasses, startIcon && "pl-9", endIcon && "pr-9", className)}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
              {endIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(baseInputClasses, className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

function FieldHelp({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function FieldError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p role="alert" className={cn("text-xs text-destructive", className)} {...props} />
  );
}

export { Input, FieldHelp, FieldError };
