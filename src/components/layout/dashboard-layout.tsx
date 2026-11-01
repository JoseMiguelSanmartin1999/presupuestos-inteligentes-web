
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { TransactionForm } from "@/features/transactions/components/transaction-form";

import {
  getCurrentUser,
  logout,
} from "@/services/auth.service";

import { getDashboardData } from "@/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";
import type { DashboardContext } from "./dashboard-context";

export function DashboardLayout() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactionModalOpen, setTransactionModalOpen] =
    useState(false);

  function refreshDashboard() {
    setRefreshKey((current) => current + 1);
  }

  function handleLogout() {
    logout();
    setTransactionModalOpen(false);
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const result = await getDashboardData();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los datos financieros.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const context: DashboardContext = {
  data,
  loading,
  error,
  refreshKey,
  refreshDashboard,
  openTransactionModal: () => setTransactionModalOpen(true),
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        <div className="min-w-0">
          <DashboardHeader />

          <main className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-8">
            <Outlet context={context} />

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {currentUser?.name ?? "Usuario"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser?.email ?? ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </main>
        </div>
      </div>

      {transactionModalOpen && (
        <TransactionForm
          onClose={() => setTransactionModalOpen(false)}
          onCreated={() => {
            setTransactionModalOpen(false);
            refreshDashboard();
          }}
        />
      )}
    </div>
  );
}
