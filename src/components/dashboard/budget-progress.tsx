
import { Target, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BudgetSummary } from "@/types/dashboard";

const currency = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function BudgetProgress({
  budgets,
}: {
  budgets: BudgetSummary[];
}) {
  const validBudgets = budgets.filter(
    (budget) =>
      typeof budget.name === "string" &&
      Number.isFinite(budget.limit) &&
      Number.isFinite(budget.spent) &&
      budget.limit >= 0 &&
      budget.spent >= 0,
  );

  return (
    <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Presupuestos del mes
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Controla tus límites de gasto
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Target size={20} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {validBudgets.length === 0 ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center px-4 py-6 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Wallet size={22} />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              No hay presupuestos para mostrar
            </p>

            <p className="mt-1 max-w-xs text-sm leading-5 text-slate-500">
              Cuando crees presupuestos y la API devuelva sus límites,
              podrás controlar cuánto has gastado y cuánto te queda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {validBudgets.map((budget, index) => {
              const percentage =
                budget.limit > 0
                  ? (budget.spent / budget.limit) * 100
                  : budget.spent > 0
                    ? 100
                    : 0;

              const exceeded = budget.spent > budget.limit;
              const reachedLimit =
                budget.limit > 0 && budget.spent >= budget.limit;

              const remaining = budget.limit - budget.spent;
              const progressWidth = Math.min(percentage, 100);

              const progressColor = exceeded
                ? "bg-rose-500"
                : reachedLimit || percentage >= 85
                  ? "bg-amber-500"
                  : "bg-blue-600";

              const status = exceeded
                ? `Excedido por ${currency(Math.abs(remaining))}`
                : remaining === 0
                  ? "Límite alcanzado"
                  : `Disponible: ${currency(remaining)}`;

              return (
                <div
                  key={`${budget.name}-${index}`}
                  className="space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {budget.name}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          exceeded
                            ? "font-medium text-rose-600"
                            : reachedLimit || percentage >= 85
                              ? "text-amber-700"
                              : "text-slate-500"
                        }`}
                      >
                        {status}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-slate-800">
                        {currency(budget.spent)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        de {currency(budget.limit)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`Presupuesto de ${budget.name}`}
                    aria-valuemin={0}
                    aria-valuemax={budget.limit || 1}
                    aria-valuenow={Math.min(
                      budget.spent,
                      budget.limit || 1,
                    )}
                    aria-valuetext={`${percentage.toFixed(0)}% utilizado`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>

                  <p className="text-right text-xs text-slate-400">
                    {percentage.toLocaleString("es-EC", {
                      maximumFractionDigits: 1,
                    })}
                    % utilizado
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
