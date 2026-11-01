
import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";

import {
  generateBudget,
  type FixedExpense,
} from "@/services/budget.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GenerateBudgetDialogProps {
  onGenerated: (result: unknown) => void;
  onCancel: () => void;
}

export function GenerateBudgetDialog({
  onGenerated,
  onCancel,
}: GenerateBudgetDialogProps) {
  const [monthlyIncome, setMonthlyIncome] = useState("1200");
  const [savingsGoalPercent, setSavingsGoalPercent] = useState("10");

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([
    { name: "Arriendo", amount: 300 },
    { name: "Servicios básicos", amount: 45 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExpense(
    index: number,
    field: keyof FixedExpense,
    value: string,
  ) {
    setFixedExpenses((current) =>
      current.map((expense, i) => {
        if (i !== index) return expense;

        return {
          ...expense,
          [field]: field === "amount" ? Number(value) : value,
        };
      }),
    );
  }

  function addExpense() {
    setFixedExpenses((current) => [
      ...current,
      { name: "", amount: 0 },
    ]);
  }

  function removeExpense(index: number) {
    setFixedExpenses((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const income = Number(monthlyIncome);
    const savings = Number(savingsGoalPercent);

    if (!Number.isFinite(income) || income <= 0) {
      setError("Ingresa un ingreso mensual mayor que cero.");
      return;
    }

    if (!Number.isFinite(savings) || savings < 0 || savings > 100) {
      setError("El objetivo de ahorro debe estar entre 0 y 100 %.");
      return;
    }

    const expenses = fixedExpenses.map((expense) => ({
      name: expense.name.trim(),
      amount: Number(expense.amount),
    }));

    if (
      expenses.some(
        (expense) =>
          !expense.name ||
          !Number.isFinite(expense.amount) ||
          expense.amount < 0,
      )
    ) {
      setError("Revisa los nombres e importes de los gastos fijos.");
      return;
    }

    setLoading(true);

    try {
      const result = await generateBudget({
        monthlyIncome: income,
        savingsGoalPercent: savings,
        fixedExpenses: expenses,
      });

      onGenerated(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar el presupuesto.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar presupuesto mensual</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="monthly-income"
                className="text-sm font-medium"
              >
                Ingreso mensual ($)
              </label>

              <input
                id="monthly-income"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={monthlyIncome}
                onChange={(event) =>
                  setMonthlyIncome(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="savings-goal"
                className="text-sm font-medium"
              >
                Objetivo de ahorro (%)
              </label>

              <input
                id="savings-goal"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={savingsGoalPercent}
                onChange={(event) =>
                  setSavingsGoalPercent(event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Gastos fijos</h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpense}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir gasto
              </Button>
            </div>

            {fixedExpenses.map((expense, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  aria-label={`Nombre del gasto ${index + 1}`}
                  placeholder="Nombre del gasto"
                  required
                  className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  value={expense.name}
                  onChange={(event) =>
                    updateExpense(index, "name", event.target.value)
                  }
                />

                <input
                  aria-label={`Importe del gasto ${index + 1}`}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-36"
                  value={expense.amount}
                  onChange={(event) =>
                    updateExpense(index, "amount", event.target.value)
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Eliminar gasto ${index + 1}`}
                  onClick={() => removeExpense(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Generar presupuesto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
    