
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  Wallet,
} from "lucide-react";

import {
  getMonthlyBudgets,
  type MonthlyBudget,
  type MonthlyBudgetSummary,
} from "@/services/budget.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const money = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function MonthlyBudgets() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [summary, setSummary] =
    useState<MonthlyBudgetSummary["summary"] | null>(null);

  const [hasBudget, setHasBudget] = useState(false);
  const [note, setNote] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMonthlyBudgets(year, month);

      setBudgets(result.budgets);
      setSummary(result.summary);
      setHasBudget(result.hasBudget);
      setNote(result.note);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los presupuestos.",
      );

      setBudgets([]);
      setSummary(null);
      setHasBudget(false);
      setNote(undefined);
    } finally {
      setLoading(false);
    }
  }, [year, month, refreshKey]);

  useEffect(() => {
    void loadBudgets();
  }, [loadBudgets]);

  const totals = useMemo(() => {
    if (!summary) {
      return {
        limit: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
      };
    }

    return {
      limit: summary.totalBudget,
      spent: summary.totalSpent,
      remaining: summary.remaining,
      percentage: summary.usagePercent,
    };
  }, [summary]);

  return (
    <section className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Presupuestos mensuales
          </h1>

          <p className="text-sm text-muted-foreground">
            Controla tus límites de gasto por categoría.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Selector de mes y año */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />

          <label
            className="text-sm font-medium"
            htmlFor="budget-month"
          >
            Mes
          </label>

          <select
            id="budget-month"
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <label
            className="text-sm font-medium"
            htmlFor="budget-year"
          >
            Año
          </label>

          <select
            id="budget-year"
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {Array.from(
              { length: 7 },
              (_, index) => today.getFullYear() - 3 + index,
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Error de carga */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex flex-col gap-3 pt-6">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              className="self-start"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Indicadores generales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Presupuestado"
          value={money.format(totals.limit)}
          loading={loading || Boolean(error)}
        />

        <SummaryCard
          title="Gastado"
          value={money.format(totals.spent)}
          loading={loading || Boolean(error)}
        />

        <SummaryCard
          title="Disponible"
          value={money.format(totals.remaining)}
          loading={loading || Boolean(error)}
        />

        <SummaryCard
          title="Consumo"
          value={`${totals.percentage.toFixed(1)}%`}
          loading={loading || Boolean(error)}
        />
      </div>

      {/* Presupuestos por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>
            {monthNames[month - 1]} de {year}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando presupuestos...
            </p>
          ) : error ? (
            <p className="text-sm text-muted-foreground">
              No se pudieron mostrar los datos.
            </p>
          ) : !hasBudget ? (
            <div className="py-8 text-center">
              <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">
                No hay un presupuesto aprobado para este mes.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona otro mes o genera un presupuesto.
              </p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">
                No hay categorías presupuestadas para este mes.
              </p>
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = budget.usagePercent;
              const progress = Math.min(
                Math.max(percentage, 0),
                100,
              );

              const exceeded = budget.status === "EXCEEDED";

              return (
                <div key={budget.id} className="space-y-2">
                  {/* Nombre y valores */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            budget.category?.color ?? "#94a3b8",
                        }}
                      />

                      <span className="font-medium">
                        {budget.category?.name ?? "Sin categoría"}
                      </span>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {money.format(budget.spent)} de{" "}
                      {money.format(budget.amount)}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`Progreso de ${
                      budget.category?.name ?? "la categoría"
                    }`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        exceeded || percentage >= 100
                          ? "bg-destructive"
                          : percentage >= 80
                            ? "bg-yellow-500"
                            : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Porcentaje y saldo disponible */}
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% utilizado</span>

                    <span>
                      {money.format(budget.remaining)} disponible
                    </span>
                  </div>

                  {/* Aviso de presupuesto excedido */}
                  {(exceeded || percentage >= 100) && (
                    <p className="text-xs font-medium text-destructive">
                      Has alcanzado o superado el límite de esta categoría.
                    </p>
                  )}
                </div>
              );
            })
          )}

          {/* Nota informativa del backend */}
          {!loading && !error && note && (
            <p className="border-t pt-4 text-xs text-muted-foreground">
              {note}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  loading,
}: {
  title: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-8 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
