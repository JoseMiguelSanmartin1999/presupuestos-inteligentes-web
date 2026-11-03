
import { useOutletContext } from "react-router";
import { Plus } from "lucide-react";

import { TransactionHistory } from "../components/transaction-history";

import type { DashboardContext } from "@/components/layout/dashboard-context";

export function TransactionsPage() {
  const {
    openTransactionModal,
    refreshDashboard,
    refreshKey,
  } = useOutletContext<DashboardContext>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Transacciones
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Administra y consulta tus movimientos financieros.
          </p>
        </div>

        <button
          type="button"
          onClick={openTransactionModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} aria-hidden="true" />
          Nueva transacción
        </button>
      </div>

      <TransactionHistory
        refreshKey={refreshKey}
        onTransactionsChanged={refreshDashboard}
      />
    </div>
  );
}
