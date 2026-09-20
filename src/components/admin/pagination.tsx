import Link from "next/link";
import { Button } from "@/components/ui/button";

function Pagination({
  page,
  totalCount,
  pageSize,
  buildHref,
}: {
  page: number;
  totalCount: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      {page > 0 ? (
        <Button asChild size="sm" variant="outline">
          <Link href={buildHref(page - 1)}>Anterior</Link>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled>
          Anterior
        </Button>
      )}
      <span className="text-xs text-muted-foreground">
        Página {page + 1} de {totalPages} · {totalCount} resultados
      </span>
      {page < totalPages - 1 ? (
        <Button asChild size="sm" variant="outline">
          <Link href={buildHref(page + 1)}>Siguiente</Link>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled>
          Siguiente
        </Button>
      )}
    </div>
  );
}

export { Pagination };
