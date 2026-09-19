import type { TicketRow } from "@/lib/tickets";

export interface TicketCheckResult {
  error?: string;
  ticket?: TicketRow;
}

export const INITIAL_TICKET_CHECK_STATE: TicketCheckResult = {};
