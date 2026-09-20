import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type OrganizerStripeAccountRow = Database["public"]["Tables"]["organizer_stripe_accounts"]["Row"];

/** Estado de la cuenta Stripe Connect del organizador autenticado (o null si no ha empezado el onboarding). */
export async function getMyStripeAccount(): Promise<OrganizerStripeAccountRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("organizer_stripe_accounts")
    .select("*")
    .eq("organizer_id", user.id)
    .maybeSingle();
  return data;
}
