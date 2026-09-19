"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const DEFAULT_MAX_PER_BUYER = 4;

interface ParsedTicketTypeForm {
  name: string;
  price: number;
  quantityTotal: number;
  maxPerBuyer: number;
}

function parseTicketTypeForm(formData: FormData): { data: ParsedTicketTypeForm } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "0");
  const quantityRaw = String(formData.get("quantityTotal") ?? "");
  const maxPerBuyerRaw = String(formData.get("maxPerBuyer") ?? String(DEFAULT_MAX_PER_BUYER));

  if (!name) return { error: "Ingresa el nombre del tipo de entrada." };
  if (name.length > 60) return { error: "El nombre es demasiado largo." };

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) return { error: "El precio debe ser 0 o mayor." };

  const quantityTotal = Number(quantityRaw);
  if (!Number.isInteger(quantityTotal) || quantityTotal <= 0) {
    return { error: "La cantidad disponible debe ser un número entero mayor a 0." };
  }

  const maxPerBuyer = Number(maxPerBuyerRaw) || DEFAULT_MAX_PER_BUYER;
  if (!Number.isInteger(maxPerBuyer) || maxPerBuyer <= 0 || maxPerBuyer > 50) {
    return { error: "El máximo por comprador debe ser un número entero entre 1 y 50." };
  }

  return { data: { name, price, quantityTotal, maxPerBuyer } };
}

export async function createTicketType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Evento inválido." };

  const parsed = parseTicketTypeForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("capacity").eq("id", eventId).maybeSingle();
  if (!event) return { error: "No tienes permiso sobre este evento." };

  const { data: existing } = await supabase
    .from("ticket_types")
    .select("quantity_total")
    .eq("event_id", eventId);
  const currentTotal = (existing ?? []).reduce((sum, t) => sum + t.quantity_total, 0);
  if (currentTotal + parsed.data.quantityTotal > event.capacity) {
    return {
      error: `La suma de entradas (${currentTotal + parsed.data.quantityTotal}) supera la capacidad del evento (${event.capacity}).`,
    };
  }

  // La policy de INSERT de ticket_types exige que el evento sea del
  // usuario autenticado (o que sea admin): si no lo es, esto falla aquí,
  // sin importar qué eventId se haya enviado.
  const { error } = await supabase.from("ticket_types").insert({
    event_id: eventId,
    name: parsed.data.name,
    price: parsed.data.price,
    quantity_total: parsed.data.quantityTotal,
    max_per_buyer: parsed.data.maxPerBuyer,
  });

  if (error) return { error: "No se pudo crear el tipo de entrada." };

  revalidatePath(`/organizador/eventos/${eventId}`);
  return { success: "Tipo de entrada creado." };
}

export async function updateTicketType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!ticketTypeId || !eventId) return { error: "Datos inválidos." };

  const parsed = parseTicketTypeForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("capacity").eq("id", eventId).maybeSingle();
  if (!event) return { error: "No tienes permiso sobre este evento." };

  const { data: existing } = await supabase
    .from("ticket_types")
    .select("id, quantity_total")
    .eq("event_id", eventId);
  const otherTotal = (existing ?? [])
    .filter((t) => t.id !== ticketTypeId)
    .reduce((sum, t) => sum + t.quantity_total, 0);
  if (otherTotal + parsed.data.quantityTotal > event.capacity) {
    return {
      error: `La suma de entradas (${otherTotal + parsed.data.quantityTotal}) supera la capacidad del evento (${event.capacity}).`,
    };
  }

  const { data, error } = await supabase
    .from("ticket_types")
    .update({
      name: parsed.data.name,
      price: parsed.data.price,
      quantity_total: parsed.data.quantityTotal,
      max_per_buyer: parsed.data.maxPerBuyer,
    })
    .eq("id", ticketTypeId)
    .eq("event_id", eventId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.message.includes("ticket_types_sold_within_total")) {
      return { error: "No puedes bajar la cantidad por debajo de lo ya vendido." };
    }
    return { error: "No se pudo actualizar el tipo de entrada." };
  }
  if (!data) return { error: "No tienes permiso para editar este tipo de entrada." };

  revalidatePath(`/organizador/eventos/${eventId}`);
  return { success: "Tipo de entrada actualizado." };
}

export async function deleteTicketType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!ticketTypeId || !eventId) return { error: "Datos inválidos." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_types")
    .delete()
    .eq("id", ticketTypeId)
    .eq("event_id", eventId)
    .select("id")
    .maybeSingle();

  if (error) return { error: "No se pudo eliminar el tipo de entrada." };
  if (!data) return { error: "No tienes permiso para eliminar este tipo de entrada." };

  revalidatePath(`/organizador/eventos/${eventId}`);
  return { success: "Tipo de entrada eliminado." };
}
