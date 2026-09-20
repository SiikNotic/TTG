import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/lib/admin";
import { formatDateShort } from "@/lib/format";
import { RoleForm } from "./role-form";
import { SearchForm } from "./search-form";

export const dynamic = "force-dynamic";

interface UsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}

const ROLE_BADGE: Record<string, "brand" | "success" | "neutral"> = {
  admin: "brand",
  organizador: "success",
  asistente: "neutral",
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page ?? "0") || 0);
  const role = sp.role as "asistente" | "organizador" | "admin" | undefined;
  const { rows, totalCount, pageSize } = await getUsers({ search: sp.search, role }, page);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.role) params.set("role", sp.role);
    if (targetPage > 0) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/usuarios?${qs}` : "/admin/usuarios";
  };

  return (
    <AdminShell active="/admin/usuarios" title="Usuarios">
      <div className="mb-4">
        <SearchForm defaultSearch={sp.search ?? ""} defaultRole={sp.role ?? "all"} />
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-3">
                <Badge variant={ROLE_BADGE[u.role]}>{u.role}</Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.fullName || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground">Desde {formatDateShort(u.createdAt)}</p>
                </div>
              </div>
              <RoleForm userId={u.id} currentRole={u.role} />
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin resultados.</p>}
      </div>

      <Pagination page={page} totalCount={totalCount} pageSize={pageSize} buildHref={buildHref} />
    </AdminShell>
  );
}
