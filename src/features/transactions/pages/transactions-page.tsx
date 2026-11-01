
import { useOutletContext } from "react-router";
import { Plus } from "lucide-react";

import type { DashboardContext } from "@/components/layout/dashboard-context";

export function TransactionsPage() {
  const { openTransactionModal } =
    useOutletContext<DashboardContext>();

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Gestión de transacciones
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulta y administra tus ingresos y gastos.
          </p>
        </div>

        <button
          type="button"
          onClick={openTransactionModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nueva transacción
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Aquí implementaremos el historial, los filtros,
          la edición y la eliminación de transacciones.
        </p>
      </div>
    </section>
  );
}
