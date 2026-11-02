import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, PlusCircle } from "lucide-react";

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
  createTransaction,
  getCategories,
} from "../services/transactions.service";

import type { Category } from "../types/transaction.types";

interface TransactionFormProps {
  onCreated: () => void;
  onClose: () => void;
}

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TransactionForm({
  onCreated,
  onClose,
}: TransactionFormProps) {
  const [fields, setFields] = useState<TransactionFieldsValue>(() => ({
    type: "EXPENSE",
    amount: "",
    description: "",
    date: getToday(),
    categoryId: "",
  }));

  const { type, amount, description, date, categoryId } = fields;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    if (submitting) return;

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    if (!description.trim()) {
      setError("Ingresa una descripción para el movimiento.");
      return;
    }

    if (!date) {
      setError("Selecciona la fecha del movimiento.");
      return;
    }

    if (!validCategory) {
      setError("Selecciona una categoría válida.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTransaction({
        amount: parsedAmount,
        type,
        description: description.trim(),
        date: new Date(`${date}T12:00:00`).toISOString(),
        categoryId,
      });

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la transacción.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={!submitting}
        className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-xl"
        onEscapeKeyDown={(event) => {
          if (submitting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (submitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PlusCircle size={23} />
            </div>

            <div>
              <DialogTitle className="text-xl">
                Nueva transacción
              </DialogTitle>

              <DialogDescription className="mt-1">
                Registra un ingreso o gasto en tus finanzas.
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
            disabled={submitting}
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingCategories ||
                !validCategory
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  Guardar transacción
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
