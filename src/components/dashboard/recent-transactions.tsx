
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  ReceiptText,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  deleteTransaction,
  getCategories,
  getTransactions,
  updateTransaction,
  type ApiTransaction,
  type Category,
  type TransactionType,
} from "@/features/transactions/services/transactions.service";

const PAGE_SIZE = 10;

const currency = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function formatTransactionDate(value: string | null | undefined) {
  if (!value) return "Fecha no disponible";

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T12:00:00` : value);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toDateInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toTransactionType(value: string): TransactionType | undefined {
  if (value === "INCOME" || value === "EXPENSE") return value;
  return undefined;
}

export function RecentTransactions({
  onTransactionsChanged,
}: {
  transactions?: import("@/types/dashboard").Transaction[];
  onTransactionsChanged?: () => void;
}) {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<ApiTransaction | null>(null);
  const [deleting, setDeleting] = useState<ApiTransaction | null>(null);
  const [saving, setSaving] = useState(false);

  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<TransactionType>("EXPENSE");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTransactions({
        from: from || undefined,
        to: to || undefined,
        type: toTransactionType(type),
        categoryId: categoryId || undefined,
        page,
        limit: PAGE_SIZE,
      });

      setTransactions(result.data);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setTotal(result.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las transacciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [from, to, type, categoryId, page]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {
        // Los movimientos siguen disponibles si falla el catálogo.
      });
  }, []);

  useEffect(() => {
    if (!editing && !deleting) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        setEditing(null);
        setDeleting(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editing, deleting, saving]);

  function resetFilters() {
    setFrom("");
    setTo("");
    setType("");
    setCategoryId("");
    setPage(1);
    setNotice(null);
  }

  function openEditor(transaction: ApiTransaction) {
    setEditing(transaction);
    setEditAmount(String(transaction.amount));
    setEditType(transaction.type);
    setEditDescription(transaction.description ?? "");
    setEditDate(toDateInput(transaction.date));
    setEditCategoryId(transaction.categoryId ?? "");
    setError(null);
    setNotice(null);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || saving) return;

    const amount = Number(editAmount);

    if (!Number.isFinite(amount) || amount < 0.01) {
      setError("El monto debe ser mayor o igual a 0.01.");
      return;
    }

    if (!editDate) {
      setError("Selecciona una fecha válida.");
      return;
    }

    if (editDescription.trim().length > 250) {
      setError("La descripción no puede superar 250 caracteres.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === editCategoryId,
    );

    if (
      editCategoryId &&
      (!selectedCategory || selectedCategory.type !== editType)
    ) {
      setError("Selecciona una categoría del tipo de movimiento correcto.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateTransaction(editing.id, {
        amount,
        type: editType,
        description: editDescription.trim(),
        date: new Date(`${editDate}T12:00:00`).toISOString(),
        categoryId: editCategoryId || null,
      });

      setEditing(null);
      setNotice("Transacción actualizada correctamente.");
      await loadTransactions();
      onTransactionsChanged?.();
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

  async function handleDelete() {
    if (!deleting || saving) return;

    setSaving(true);
    setError(null);

    try {
      await deleteTransaction(deleting.id);
      setDeleting(null);
      setNotice("Transacción eliminada correctamente.");

      // Si se borró el último registro de la página,
      // retrocedemos para evitar dejar una página vacía.
      if (transactions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTransactions();
      }

      onTransactionsChanged?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la transacción.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredCategories = categories.filter(
    (category) => category.type === editType,
  );

  return (
    <>
      <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Transacciones
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Consulta, filtra y administra tus movimientos.
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ReceiptText size={20} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Desde</span>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Hasta</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Tipo</span>
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                <option value="">Todos los movimientos</option>
                <option value="INCOME">Ingresos</option>
                <option value="EXPENSE">Gastos</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Categoría</span>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {total} movimiento{total === 1 ? "" : "s"} encontrado
              {total === 1 ? "" : "s"}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Limpiar filtros
            </button>
          </div>

          {notice && (
            <div
              role="status"
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Cargando transacciones...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-4 py-6 text-center">
              <Filter size={24} className="mb-3 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">
                No se encontraron movimientos
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Prueba otros filtros o registra una nueva transacción.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const isIncome = transaction.type === "INCOME";
                const amount = Number(transaction.amount);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft size={19} />
                      ) : (
                        <ArrowUpRight size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {transaction.description || "Movimiento sin descripción"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {transaction.category?.name ?? "Sin categoría"}
                        {" · "}
                        {formatTransactionDate(transaction.date)}
                      </p>
                    </div>

                    <p
                      className={`shrink-0 text-right text-sm font-semibold tabular-nums ${
                        isIncome ? "text-emerald-600" : "text-slate-800"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {currency(Number.isFinite(amount) ? amount : 0)}
                    </p>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Editar transacción"
                        aria-label="Editar transacción"
                        onClick={() => openEditor(transaction)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title="Eliminar transacción"
                        aria-label="Eliminar transacción"
                        onClick={() => {
                          setDeleting(transaction);
                          setError(null);
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Página {page} de {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditing(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-transaction-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2
                id="edit-transaction-title"
                className="text-lg font-semibold text-slate-900"
              >
                Editar transacción
              </h2>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar formulario"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Tipo de movimiento</span>
                <select
                  value={editType}
                  onChange={(event) => {
                    setEditType(event.target.value as TransactionType);
                    setEditCategoryId("");
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Monto ($)</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Descripción</span>
                <input
                  type="text"
                  maxLength={250}
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Fecha</span>
                <input
                  required
                  type="date"
                  value={editDate}
                  onChange={(event) => setEditDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-slate-700">Categoría</span>
                <select
                  value={editCategoryId}
                  onChange={(event) => setEditCategoryId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <option value="">Sin categoría</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-transaction-title"
              className="text-lg font-semibold text-slate-900"
            >
              ¿Eliminar esta transacción?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vas a eliminar «
              {deleting.description || "Movimiento sin descripción"}».
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setDeleting(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
