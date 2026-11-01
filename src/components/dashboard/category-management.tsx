
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Tags } from "lucide-react";

import {
  createCategory,
  getCategories,
  type Category,
  type TransactionType,
} from "@/services/transactions.service";

const defaultColors = [
  "#F97316",
  "#10B981",
  "#6366F1",
  "#0EA5E9",
  "#EC4899",
  "#8B5CF6",
  "#EAB308",
  "#64748B",
];

interface CategoryManagementProps {
  onCategoriesChanged?: () => void;
}

export function CategoryManagement({
  onCategoriesChanged,
}: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [color, setColor] = useState(defaultColors[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    setError(null);

    try {
      const result = await getCategories();
      setCategories(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las categorías.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Escribe el nombre de la categoría.");
      return;
    }

    setSaving(true);

    try {
      const created = await createCategory({
        name: normalizedName,
        type,
        color,
      });

      setCategories((current) => {
        if (current.some((category) => category.id === created.id)) {
          return current;
        }

        return [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name, "es"),
        );
      });

      setName("");
      setSuccess(`Categoría "${created.name}" creada correctamente.`);
      onCategoriesChanged?.();

      // Vuelve a consultar la API para mantener la lista sincronizada.
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la categoría.",
      );
    } finally {
      setSaving(false);
    }
  }

  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );

  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME",
  );

  function renderCategoryList(items: Category[]) {
    if (items.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Todavía no hay categorías de este tipo.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((category) => (
          <div
            key={category.id}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.color || "#64748B" }}
            />
            <span className="truncate text-sm font-medium text-slate-700">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Tags size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Gestión de categorías
          </h2>
          <p className="text-sm text-slate-500">
            Organiza tus ingresos y gastos.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
      >
        <div>
          <label
            htmlFor="category-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nombre de la categoría
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Transporte"
            maxLength={80}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="category-type"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Tipo
          </label>
          <select
            id="category-type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as TransactionType)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category-color"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Color
          </label>
          <div className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-200 px-3">
            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="size-7 cursor-pointer border-0 bg-transparent p-0"
              aria-label="Seleccionar color de categoría"
            />
            <span className="text-sm text-slate-600">{color}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Plus size={17} />
          )}
          Crear categoría
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mb-4 break-words rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800">Gastos</h3>
            <span className="text-xs text-slate-500">
              {expenseCategories.length} categorías
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Cargando categorías...</p>
          ) : (
            renderCategoryList(expenseCategories)
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800">Ingresos</h3>
            <span className="text-xs text-slate-500">
              {incomeCategories.length} categorías
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Cargando categorías...</p>
          ) : (
            renderCategoryList(incomeCategories)
          )}
        </div>
      </div>

      {!loading && (
        <button
          type="button"
          onClick={() => void loadCategories()}
          className="mt-5 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Actualizar categorías
        </button>
      )}
    </section>
  );
}
