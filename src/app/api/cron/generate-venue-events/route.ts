import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const DAYS_AHEAD = 14;

/**
 * Corre una vez al día (ver vercel.json) para mantener siempre ~2 semanas
 * de eventos generados por cada "negocio recurrente" activo. Idempotente:
 * generate_venue_series_events nunca duplica un día que ya tiene evento,
 * así que correr esto de más (o dos veces seguidas) es inofensivo.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: seriesList, error } = await supabase.from("venue_series").select("id").eq("status", "activa");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let eventsGenerated = 0;
  for (const series of seriesList ?? []) {
    const { data, error: rpcError } = await supabase.rpc("generate_venue_series_events", {
      p_series_id: series.id,
      p_days_ahead: DAYS_AHEAD,
    });
    if (rpcError) {
      console.error("generate_venue_series_events falló", series.id, rpcError);
      continue;
    }
    eventsGenerated += data?.length ?? 0;
  }

  return NextResponse.json({ ok: true, seriesProcessed: seriesList?.length ?? 0, eventsGenerated });
}
