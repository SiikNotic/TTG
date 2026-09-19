"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { deleteTicketType } from "@/lib/actions/ticket-types";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { TicketTypeRow } from "@/lib/organizer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-message";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { formatPrice } from "@/lib/format";
import { TicketTypeForm } from "@/components/organizer/ticket-type-form";

function DeleteTicketTypeButton({ eventId, ticketTypeId }: { eventId: string; ticketTypeId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(deleteTicketType, INITIAL_ACTION_STATE);

  if (confirming) {
    return (
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="ticketTypeId" value={ticketTypeId} />
        <span className="text-xs text-muted-foreground">¿Eliminar?</span>
        <Button type="submit" size="sm" variant="destructive">
          Sí
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          No
        </Button>
        {state.error && <span className="text-xs text-destructive">{state.error}</span>}
      </form>
    );
  }

  return (
    <Button type="button" size="icon" variant="ghost" aria-label="Eliminar" onClick={() => setConfirming(true)}>
      <Trash2 className="size-4" />
    </Button>
  );
}

function TicketTypeManager({ eventId, ticketTypes }: { eventId: string; ticketTypes: TicketTypeRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TicketTypeRow | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(ticket: TicketTypeRow) {
    setEditing(ticket);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Tipos de entrada</h2>
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-4" /> Agregar
        </Button>
      </div>

      {ticketTypes.length === 0 ? (
        <EmptyState
          title="Sin tipos de entrada"
          description="Agrega al menos uno para poder publicar el evento."
          action={{ label: "Agregar tipo de entrada", onClick: openCreate }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {ticketTypes.map((t) => (
            <Card key={t.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(t.price)} · {t.quantity_sold}/{t.quantity_total} vendidas · máx.{" "}
                  {t.max_per_buyer}/comprador
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" size="icon" variant="ghost" aria-label="Ver como comprador" asChild>
                  <Link href={`/comprar/${t.id}`} target="_blank">
                    <ShoppingCart className="size-4" />
                  </Link>
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Editar" onClick={() => openEdit(t)}>
                  <Pencil className="size-4" />
                </Button>
                <DeleteTicketTypeButton eventId={eventId} ticketTypeId={t.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent key={editing?.id ?? "new"}>
          <ModalHeader>
            <ModalTitle>{editing ? "Editar tipo de entrada" : "Nuevo tipo de entrada"}</ModalTitle>
            <ModalDescription>
              El máximo por comprador se valida también en el servidor.
            </ModalDescription>
          </ModalHeader>
          <div className="mt-4">
            <TicketTypeForm eventId={eventId} ticket={editing} onSuccess={() => setModalOpen(false)} />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export { TicketTypeManager };
