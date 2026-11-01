import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil } from "lucide-react";

import {
  TransactionFields,
  type TransactionFieldsValue,
} from "./transaction-fields";
import {
  getCategories,
  updateTransaction,
} from "../services/transactions.service";

import type {
  ApiTransaction,
  Category,
  UpdateTransactionDto,
} from "../types/transaction.types";

interface EditTransactionDialogProps {
  transaction: ApiTransaction;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditTransactionDialog({
  transaction,
  onClose,
  onUpdated,
}: EditTransactionDialogProps) {
  const [fields, setFields] = useState<TransactionFieldsValue>(() => ({
    type: transaction.type,
    amount: String(transaction.amount),
    description: transaction.description ?? "",
    date: transaction.date.slice(0, 10),
    categoryId: transaction.categoryId ?? "",
  }));

  const { type, amount, description, date, categoryId } = fields;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (!cancelled) {
          setCategories(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las categorías.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const validCategory = categories.some(
    (category) =>
      category.id === categoryId &&
      category.type === type,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un importe válido mayor que cero.");
      return;
    }

    if (!date) {
      setError("Selecciona una fecha.");
      return;
    }

    if (!validCategory) {
      setError("Selecciona una categoría válida para el tipo elegido.");
      return;
    }

    const changes: UpdateTransactionDto = {
      type,
      amount: parsedAmount,
      description: description.trim(),
      date,
      categoryId,
    };

    setSaving(true);
    setError(null);

    try {
      await updateTransaction(transaction.id, changes);
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la transacción.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Pencil size={21} />
          </div>

          <div>
            <h2
              id="edit-transaction-title"
              className="text-xl font-bold text-slate-900"
            >
              Editar transacción
            </h2>
            <p className="text-sm text-slate-500">
              Modifica los datos del movimiento.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <TransactionFields
            value={fields}
            onChange={(nextFields) => {
              setFields(nextFields);
              setError(null);
            }}
            categories={categories}
            loadingCategories={loadingCategories}
            disabled={saving}
          />

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
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || loadingCategories}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
