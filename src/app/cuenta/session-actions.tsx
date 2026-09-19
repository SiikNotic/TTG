import { signOut, signOutEverywhere } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

function SessionActions() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <form action={signOut}>
        <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-auto">
          Cerrar sesión
        </Button>
      </form>
      <form action={signOutEverywhere}>
        <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
          Cerrar sesión en todos los dispositivos
        </Button>
      </form>
    </div>
  );
}

export { SessionActions };
