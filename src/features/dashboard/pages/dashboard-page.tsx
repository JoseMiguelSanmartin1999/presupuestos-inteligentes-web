import { useOutletContext } from "react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { useState } from "react";
import type { DashboardContext } from "@/components/layout/dashboard-context";

const currency = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const dataSource = import.meta.env.VITE_DATA_SOURCE ?? "demo";

export function DashboardPage() {
  const {
    data,
    loading,
    error,
    refreshDashboard,
    openTransactionModal,
  } = useOutletContext<DashboardContext>();

  const [dateLabel] = useState(() =>
  new Intl.DateTimeFormat("es-EC", {
    month: "long",
    year: "numeric",
  }).format(new Date()),
);

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Resumen financiero
            </h1>

            <Badge
              className={
                dataSource === "api"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }
            >
              {dataSource === "api" ? "API REAL" : "DEMO"}
            </Badge>
          </div>

          <p className="text-sm text-slate-500">
            Aquí tienes una visión general de tus finanzas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays size={17} className="text-blue-600" />
            <span className="capitalize">{dateLabel}</span>
          </div>

          <button
            type="button"
            onClick={openTransactionModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            Nueva transacción
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <p className="font-semibold">No se pudo cargar el dashboard.</p>
          <p className="mt-1 break-words">{error}</p>

          {dataSource === "api" && (
            <p className="mt-2">
              Comprueba que hayas iniciado sesión, que el token siga vigente y
              que el backend permita las peticiones del frontend.
            </p>
          )}

          <button
            type="button"
            onClick={refreshDashboard}
            className="mt-3 rounded-lg border border-rose-300 px-3 py-2 font-medium transition hover:bg-rose-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading && (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
        >
          Cargando resumen financiero…
        </div>
      )}

      {!loading && data && (
        <>
          {/* Indicadores financieros */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Balance del mes"
              value={currency(data.balance)}
              description="Ingresos menos gastos"
              icon={Wallet}
              iconClassName="bg-blue-50 text-blue-600"
            />

            <MetricCard
              title="Ingresos del mes"
              value={currency(data.income)}
              description="Ingresos registrados"
              icon={ArrowDownRight}
              iconClassName="bg-emerald-50 text-emerald-600"
            />

            <MetricCard
              title="Gastos del mes"
              value={currency(data.expenses)}
              description="Gastos registrados"
              icon={ArrowUpRight}
              iconClassName="bg-orange-50 text-orange-600"
            />

            <MetricCard
              title="Tasa de ahorro"
              value={`${data.savingsRate.toLocaleString("es-EC", {
                maximumFractionDigits: 1,
              })}%`}
              description="Porcentaje de ingresos"
              icon={PiggyBank}
              iconClassName="bg-violet-50 text-violet-600"
            />
          </section>

          {/* Gráfico y resumen de presupuestos */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <SpendingChart data={data.monthlyActivity} />
            <BudgetProgress budgets={data.budgets} />
          </section>

          {/* Transacciones y balance */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <RecentTransactions
              transactions={data.recentTransactions}
              onTransactionsChanged={refreshDashboard}
            />

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/15">
                <CircleDollarSign size={23} />
              </div>

              <p className="text-sm font-medium text-blue-100">
                Balance del mes
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {currency(data.balance)}
              </p>

              <p className="mt-3 max-w-xs text-sm leading-6 text-blue-100">
                Diferencia entre tus ingresos y gastos registrados durante el
                periodo seleccionado.
              </p>

              <div className="mt-6 h-px bg-white/20" />

              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-blue-100">Estado del periodo</span>
                <span className="rounded-full bg-white/15 px-3 py-1 font-medium">
                  {data.balance >= 0 ? "Balance positivo" : "Gastos superiores"}
                </span>
              </div>
            </div>
          </section>

          <p className="text-center text-xs text-slate-400">
            {dataSource === "demo"
              ? "Modo demostración: los importes mostrados son ficticios y no provienen de tu cuenta."
              : "Los importes financieros se obtienen de la API. Las secciones sin endpoints conectados pueden aparecer vacías."}
          </p>
        </>
      )}
    </div>
  );
}
