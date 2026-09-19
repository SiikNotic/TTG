import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-medium text-primary">TTG</p>
      <h1 className="max-w-md text-2xl font-semibold text-foreground">
        Base visual en construcción
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Las pantallas del producto aún no se han construido. Revisa el sistema de diseño
        mientras tanto.
      </p>
      <Button asChild>
        <Link href="/style-guide">Ver sistema de diseño</Link>
      </Button>
    </main>
  );
}
