import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileText,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { exportFinancialReportCsv } from "../utils/export-report-csv";
import { exportFinancialReportPdf } from "../utils/export-report-pdf";

import {
  getFinancialEvolution,
  getMonthlyFinancialReport,
} from "@/services/reports.service";

import { FinancialEvolutionChart } from "../components/financial-evolution-chart";

import type {
  FinancialEvolutionReport,
  MonthlyFinancialReport,
} from "../types/report.types";

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const months = [
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

export function ReportsPage() {
  const [initialDate] = useState(() => new Date());
  const [year, setYear] = useState(
    () => initialDate.getFullYear(),
  );

  const [month, setMonth] = useState(
    () => initialDate.getMonth() + 1,
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const availableYears = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) => initialDate.getFullYear() - 3 + index,
      ),
    [initialDate],
  );

  const [reportState, setReportState] = useState<{
    key: string;
    data: MonthlyFinancialReport | null;
    error: string | null;
  } | null>(null);

  const requestKey = `${year}-${month}-${refreshKey}`;
  const isCurrent = reportState?.key === requestKey;

  const loading = !isCurrent;
  const report = isCurrent ? reportState.data : null;
  const error = isCurrent ? reportState.error : null;

  const [evolutionState, setEvolutionState] = useState<{
    key: string;
    data: FinancialEvolutionReport | null;
    error: string | null;
  } | null>(null);

  const evolutionKey = `${year}-${month}-${refreshKey}`;
  const evolutionLoading = evolutionState?.key !== evolutionKey;
  const evolution = evolutionLoading
    ? null
    : evolutionState.data;
  const evolutionError = evolutionLoading
    ? null
    : evolutionState.error;

  const canExport =
    !loading &&
    !evolutionLoading &&
    report !== null &&
    evolution !== null;

  function handleExportCsv() {
    if (!report || !evolution || !canExport) {
      return;
    }

    exportFinancialReportCsv(report, evolution);
  }

  async function handleExportPdf() {
    if (!report || !evolution || !canExport) {
      return;
    }

    try {
      await exportFinancialReportPdf(report, evolution);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        const result = await getMonthlyFinancialReport(
          year,
          month,
        );

        if (!cancelled) {
          setReportState({
            key: requestKey,
            data: result,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setReportState({
            key: requestKey,
            data: null,
            error:
              err instanceof Error
                ? err.message
                : "No se pudo cargar el reporte.",
          });
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [year, month, requestKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvolution() {
      try {
        const result = await getFinancialEvolution(year, month, 6);

        if (!cancelled) {
          setEvolutionState({
            key: evolutionKey,
            data: result,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setEvolutionState({
            key: evolutionKey,
            data: null,
            error:
              err instanceof Error
                ? err.message
                : "No se pudo cargar la evolución financiera.",
          });
        }
      }
    }

    void loadEvolution();

    return () => {
      cancelled = true;
    };
  }, [year, month, evolutionKey]);

  const summary = report?.summary;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Informes financieros
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Analiza tus ingresos, gastos y distribución financiera
          por período.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <select
          aria-label="Seleccionar mes"
          value={month}
          onChange={(event) =>
            setMonth(Number(event.target.value))
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          {months.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          aria-label="Seleccionar año"
          value={year}
          onChange={(event) =>
            setYear(Number(event.target.value))
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          {availableYears.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            setRefreshKey((current) => current + 1)
          }
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Actualizar
        </button>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!canExport}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>

        <button
          type="button"
          onClick={() => {
            void handleExportPdf();
          }}
          disabled={!canExport}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500">
          Cargando informe financiero...
        </p>
      )}

      {!loading && summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric
              title="Ingresos"
              value={currency.format(summary.income)}
              icon={<ArrowUpRight className="h-5 w-5" />}
            />

            <ReportMetric
              title="Gastos"
              value={currency.format(summary.expenses)}
              icon={<ArrowDownRight className="h-5 w-5" />}
            />

            <ReportMetric
              title="Balance"
              value={currency.format(summary.balance)}
              icon={<Wallet className="h-5 w-5" />}
            />

            <ReportMetric
              title="Tasa de ahorro"
              value={`${summary.savingsRate.toFixed(2)}%`}
              icon={<Wallet className="h-5 w-5" />}
            />
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Gastos por categoría
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribución de los gastos registrados en{" "}
              {months[month - 1]} de {year}.
            </p>

            {report!.expenseCategories.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                No hay gastos registrados para este período.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {report!.expenseCategories.map((category) => (
                  <div
                    key={category.categoryId ?? "uncategorized"}
                    className="space-y-2"
                  >
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">
                        {category.name}
                      </span>

                      <span>
                        {currency.format(category.amount)}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            Math.max(category.percentage, 0),
                            100,
                          )}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {category.count} movimientos
                      </span>
                      <span>
                        {category.percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-500">
            Total de movimientos:{" "}
            <strong>{summary.transactionsCount}</strong>
          </p>
        </>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Evolución financiera
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Comparación de los seis meses hasta {months[month - 1]} de {year}.
          </p>
        </div>

        {evolutionLoading && (
          <p className="text-sm text-slate-500">
            Cargando evolución financiera...
          </p>
        )}

        {evolutionError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {evolutionError}
          </div>
        )}

        {evolution && (
          <FinancialEvolutionChart data={evolution.data} />
        )}
      </section>
    </section>
  );
}

function ReportMetric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <span className="text-slate-600">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}
