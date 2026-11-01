
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-transaction-title"
        aria-describedby="delete-transaction-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={24} />
        </div>

        <h2
          id="delete-transaction-title"
          className="text-xl font-bold text-slate-900"
        >
          ¿Eliminar transacción?
        </h2>

        <p
          id="delete-transaction-description"
          className="mt-3 text-sm leading-6 text-slate-600"
        >
          Estás a punto de eliminar{" "}
          <strong>
            {transaction.description || "esta transacción"}
          </strong>
          . Esta acción no se puede deshacer.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
