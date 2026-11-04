import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import {
  getCategories,
  getTransactions,
} from "../services/transactions.service";
import type {
  ApiTransaction,
  Category,
  TransactionType,
} from "../types/transaction.types";

interface TransactionHistoryProps {
  refreshKey?: number;
  onTransactionsChanged?: () => void;
}

const PAGE_SIZE = 10;

function formatCurrency(value: string | number): string {
  const amount = Number(value);

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Fecha no disponible";
  const date = value.slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export function TransactionHistory({
  refreshKey = 0,
  onTransactionsChanged,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [type, setType] = useState<"" | TransactionType>("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [categoryReloadKey, setCategoryReloadKey] = useState(0);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<ApiTransaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    useState<ApiTransaction | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (!cancelled) {
          setCategories(result);
          setCategoriesError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(
            err instanceof Error ? err.message : "No se pudieron cargar las categorías.",
          );
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [categoryReloadKey, refreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        const result = await getTransactions({
          page,
          limit: PAGE_SIZE,
          type: type || undefined,
          categoryId: categoryId || undefined,
          from: from || undefined,
          to: to || undefined,
        });

        if (cancelled) return;

        const nextTotalPages = Math.max(1, result.pagination.totalPages);
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
          return;
        }

        setTransactions(result.data);
        setTotal(result.pagination.total);
        setTotalPages(nextTotalPages);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las transacciones.",
        );
        setTransactions([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [page, type, categoryId, from, to, refreshKey, reloadKey]);

  function resetFilters() {
    setLoading(true);
    setType("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function refresh() {
    setLoading(true);
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Historial de movimientos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulta tus ingresos y gastos registrados.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {categoriesError && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <span>No se pudieron cargar las categorías: {categoriesError}</span>
            <button
              type="button"
              onClick={() => setCategoryReloadKey((current) => current + 1)}
              className="font-semibold underline underline-offset-2"
            >
              Reintentar categorías
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            Tipo
            <select
              value={type}
              onChange={(event) => {
                setLoading(true);
                setType(event.target.value as "" | TransactionType);
                setCategoryId("");
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            >
              <option value="">Todos</option>
              <option value="INCOME">Ingresos</option>
              <option value="EXPENSE">Gastos</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            Categoría
            <select
              value={categoryId}
              onChange={(event) => {
                setLoading(true);
                setCategoryId(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            >
              <option value="">Todas</option>
              {categories
                .filter((category) => !type || category.type === type)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            Desde
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setLoading(true);
                setFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            Hasta
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setLoading(true);
                setTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Total de movimientos:{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </p>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Reintentar consulta
            </button>
          </div>
        )}

        {loading ? (
          <div role="status" className="p-10 text-center text-sm text-slate-500">
            Cargando transacciones...
          </div>
        ) : error ? null : transactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No se encontraron transacciones.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Movimiento</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-right">Importe</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";
                  const category =
                    transaction.category ??
                    categories.find(
                      (cat) => cat.id === transaction.categoryId,
                    );

                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-9 items-center justify-center rounded-lg ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={18} />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>

                          <span className="font-medium text-slate-800">
                            {transaction.description || "Sin descripción"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          {category?.color && (
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <span>{category?.name ?? "Sin categoría"}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {isIncome ? "Ingreso" : "Gasto"}
                        </span>
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-semibold ${
                          isIncome ? "text-emerald-600" : "text-slate-800"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setTransactionToEdit(transaction)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Editar transacción"
                            aria-label={`Editar ${transaction.description || "transacción"}`}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTransactionToDelete(transaction)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Eliminar transacción"
                            aria-label={`Eliminar ${transaction.description || "transacción"}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {transactionToDelete && (
          <DeleteTransactionDialog
            transaction={transactionToDelete}
            onClose={() => setTransactionToDelete(null)}
            onDeleted={() => {
              setTransactionToDelete(null);

              // Si eliminamos el último registro de una página,
              // regresamos a la página anterior.
              if (transactions.length === 1 && page > 1) {
                setLoading(true);
                setPage((current) => current - 1);
              } else {
                refresh();
              }

              // Actualiza los indicadores financieros.
              onTransactionsChanged?.();
            }}
          />
        )}

        {transactionToEdit && (
          <EditTransactionDialog
            transaction={transactionToEdit}
            onClose={() => setTransactionToEdit(null)}
            onUpdated={() => {
              setTransactionToEdit(null);

              // Recargar el historial conservando filtros y página.
              refresh();

              // Actualizar los indicadores del dashboard.
              onTransactionsChanged?.();
            }}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.max(1, current - 1));
              }}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
