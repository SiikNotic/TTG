"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  table: "tickets" | "orders" | "ticket_types";
  filter?: string;
}

interface RealtimeRefresherProps {
  channelName: string;
  subscriptions: Subscription[];
}

/**
 * No renderiza nada: solo escucha cambios en Postgres (disponibilidad,
 * ventas, reembolsos, estado de tickets) vía Supabase Realtime y llama
 * router.refresh() para que el Server Component de la página vuelva a
 * calcular los números con la MISMA lógica que usa en el primer render
 * (una sola fuente de verdad, sin duplicar la agregación en el cliente).
 */
function RealtimeRefresher({ channelName, subscriptions }: RealtimeRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel = supabase.channel(channelName);

    for (const sub of subscriptions) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: sub.table, filter: sub.filter },
        () => router.refresh()
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Las subscripciones son estables por página (no cambian en caliente).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  return null;
}

export { RealtimeRefresher };
