
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LoaderCircle,
  PlusCircle,
  X,
} from "lucide-react";

import {
  createTransaction,
  getCategories,
  type Category,
  type TransactionType,
} from "@/services/transactions.service";

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
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday());
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setError(null);

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

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (!availableCategories.some((category) => category.id === categoryId)) {
      setCategoryId(availableCategories[0]?.id ?? "");
    }
  }, [availableCategories, categoryId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, submitting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto mayor que cero.");
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

    if (!categoryId) {
      setError("Selecciona una categoría válida para este movimiento.");
      return;
    }

    setSubmitting(true);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PlusCircle size={23} />
            </div>

            <div>
              <h2
                id="transaction-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                Nueva transacción
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Registra un ingreso o gasto en tus finanzas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar formulario"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo de movimiento
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={type === "EXPENSE"}
                onClick={() => {
                  setType("EXPENSE");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === "EXPENSE"
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ArrowUpRight size={18} />
                Gasto
              </button>

              <button
                type="button"
                aria-pressed={type === "INCOME"}
                onClick={() => {
                  setType("INCOME");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === "INCOME"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ArrowDownLeft size={18} />
                Ingreso
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-amount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Monto (USD)
              </label>
              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Ej. 45.50"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="transaction-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Fecha
              </label>
              <input
                id="transaction-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Descripción
            </label>
            <input
              id="transaction-description"
              type="text"
              required
              maxLength={200}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                type === "EXPENSE"
                  ? "Ej. Almuerzo con compañeros"
                  : "Ej. Salario mensual"
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Categoría
            </label>
            <select
              id="transaction-category"
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={loadingCategories || availableCategories.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {loadingCategories
                  ? "Cargando categorías..."
                  : availableCategories.length === 0
                    ? `No hay categorías de ${
                        type === "EXPENSE" ? "gastos" : "ingresos"
                      }`
                    : "Selecciona una categoría"}
              </option>

              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {!loadingCategories && availableCategories.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700">
                Primero crea una categoría de este tipo en Gestión de categorías.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="break-words rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingCategories ||
                !categoryId ||
                availableCategories.length === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
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
      </section>
    </div>
  );
}
