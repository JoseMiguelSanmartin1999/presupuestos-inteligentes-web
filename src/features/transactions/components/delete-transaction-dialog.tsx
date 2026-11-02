import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { deleteTransaction } from "../services/transactions.service";

import type { ApiTransaction } from "../types/transaction.types";

interface DeleteTransactionDialogProps {
  transaction: ApiTransaction;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  onClose,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteTransaction(transaction.id);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la transacción.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !deleting) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={!deleting}
        className="border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (deleting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (deleting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <DialogTitle className="text-xl">
            ¿Eliminar transacción?
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-slate-600">
            Estás a punto de eliminar{" "}
            <strong className="text-slate-900">
              {transaction.description || "esta transacción"}
            </strong>
            . Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {deleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
