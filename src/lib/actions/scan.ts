"use server";

import { createClient } from "@/lib/supabase/server";

export type ScanResultCode =
  | "VALIDO"
  | "YA_UTILIZADO"
  | "CANCELADO"
  | "REEMBOLSADO"
  | "EXPIRADO"
  | "INVALIDO"
  | "EVENTO_INCORRECTO"
  | "ERROR";

export interface ScanResult {
  code: ScanResultCode;
  ticketId?: string;
  serial?: string;
  ticketTypeName?: string;
}

/**
 * Escaneo atómico: la base de datos es la única fuente de verdad. Esta
 * acción nunca decide nada por su cuenta (ni siquiera "el token se ve bien
 * formado") — cada token, sin excepción, se resuelve llamando a
 * scan_ticket, que hace la validación y el ACTIVE -> USED en la misma
 * transacción bloqueada.
 */
export async function scanTicket(eventId: string, rawToken: string): Promise<ScanResult> {
  const token = rawToken.trim();
  if (!eventId || !token) return { code: "INVALIDO" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("scan_ticket", {
    p_raw_token: token,
    p_event_id: eventId,
  });

  const row = data?.[0];
  if (error || !row) return { code: "ERROR" };

  return {
    code: row.result as ScanResultCode,
    ticketId: row.ticket_id ?? undefined,
    serial: row.serial ?? undefined,
    ticketTypeName: row.ticket_type_name ?? undefined,
  };
}
