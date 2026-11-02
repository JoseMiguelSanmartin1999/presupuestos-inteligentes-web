
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

    if (!description.trim()) {
      setError("Ingresa una descripción para el movimiento.");
      return;
    }

    if (!date) {
      setError("Selecciona una fecha.");
      return;
    }

    if (!validCategory) {
      setError(
        "Selecciona una categoría válida para el tipo elegido.",
      );
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={!saving}
        className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (saving) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (saving) event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Pencil size={21} />
            </div>

            <div>
              <DialogTitle className="text-xl">
                Editar transacción
              </DialogTitle>

              <DialogDescription className="mt-1">
                Modifica los datos del movimiento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-4 space-y-4"
        >
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
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
              disabled={
                saving ||
                loadingCategories ||
                !validCategory
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
