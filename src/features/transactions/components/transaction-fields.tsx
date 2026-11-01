
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type {
  Category,
  TransactionType,
} from "../types/transaction.types";

export interface TransactionFieldsValue {
  type: TransactionType;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
}

interface TransactionFieldsProps {
  value: TransactionFieldsValue;
  onChange: (value: TransactionFieldsValue) => void;
  categories: Category[];
  loadingCategories: boolean;
  disabled?: boolean;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

export function TransactionFields({
  value,
  onChange,
  categories,
  loadingCategories,
  disabled = false,
}: TransactionFieldsProps) {
  const availableCategories = categories.filter(
    (category) => category.type === value.type,
  );

  const categoryIsValid = availableCategories.some(
    (category) => category.id === value.categoryId,
  );

  const selectedCategoryId = categoryIsValid
    ? value.categoryId
    : "";

  function update(
    changes: Partial<TransactionFieldsValue>,
  ) {
    onChange({ ...value, ...changes });
  }

  function changeType(type: TransactionType) {
    update({
      type,
      categoryId: "",
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Tipo de movimiento
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            aria-pressed={value.type === "EXPENSE"}
            onClick={() => changeType("EXPENSE")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
              value.type === "EXPENSE"
                ? "border-orange-300 bg-orange-50 text-orange-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowUpRight size={18} />
            Gasto
          </button>

          <button
            type="button"
            disabled={disabled}
            aria-pressed={value.type === "INCOME"}
            onClick={() => changeType("INCOME")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
              value.type === "INCOME"
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
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Monto (USD)
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            disabled={disabled}
            value={value.amount}
            onChange={(event) =>
              update({ amount: event.target.value })
            }
            placeholder="Ej. 45.50"
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Fecha
          <input
            type="date"
            required
            disabled={disabled}
            value={value.date}
            onChange={(event) =>
              update({ date: event.target.value })
            }
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        Descripción
        <input
          type="text"
          required
          maxLength={200}
          disabled={disabled}
          value={value.description}
          onChange={(event) =>
            update({ description: event.target.value })
          }
          placeholder={
            value.type === "EXPENSE"
              ? "Ej. Almuerzo con compañeros"
              : "Ej. Salario mensual"
          }
          className={inputClass}
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        Categoría
        <select
          required
          value={selectedCategoryId}
          disabled={
            disabled ||
            loadingCategories ||
            availableCategories.length === 0
          }
          onChange={(event) =>
            update({ categoryId: event.target.value })
          }
          className={`${inputClass} bg-white`}
        >
          <option value="">
            {loadingCategories
              ? "Cargando categorías..."
              : availableCategories.length === 0
                ? "No hay categorías disponibles"
                : "Selecciona una categoría"}
          </option>

          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {!loadingCategories &&
          availableCategories.length === 0 && (
            <span className="block text-xs text-amber-700">
              Primero crea una categoría para este tipo de movimiento.
            </span>
          )}
      </label>
    </div>
  );
}
