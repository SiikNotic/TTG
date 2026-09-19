import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-24 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors duration-fast ease-standard",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
