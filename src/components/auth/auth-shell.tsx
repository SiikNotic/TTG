import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/ui/brand-mark";

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 py-6 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <BrandMark />
          TTG
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
          </div>

          <Card>
            <CardContent className="pt-6">{children}</CardContent>
          </Card>

          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export { AuthShell };
