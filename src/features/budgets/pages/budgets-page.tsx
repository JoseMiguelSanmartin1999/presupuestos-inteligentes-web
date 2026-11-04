import { useState } from "react";
import { useOutletContext } from "react-router";

import { BudgetProposal } from "@/components/dashboard/budget-proposal";
import { MonthlyBudgets } from "@/components/dashboard/monthly-budgets";
import type { DashboardContext } from "@/components/layout/dashboard-context";

export function BudgetsPage() {
  const { refreshDashboard } = useOutletContext<DashboardContext>();
  const [budgetsRefreshKey, setBudgetsRefreshKey] = useState(0);

  function handleBudgetApproved() {
    refreshDashboard();
    setBudgetsRefreshKey((current) => current + 1);
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Gestión de presupuestos
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Genera una propuesta según tus ingresos, gastos fijos
          y gastos históricos. Revísala antes de aprobarla.
        </p>
      </div>

      <BudgetProposal onApproved={handleBudgetApproved} />

      <MonthlyBudgets refreshKey={budgetsRefreshKey} />
    </section>
  );
}