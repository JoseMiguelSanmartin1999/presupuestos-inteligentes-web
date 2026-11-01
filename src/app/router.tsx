
import { Navigate, Route, Routes } from "react-router";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

function PendingPage({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Esta sección está pendiente de migración.
      </p>
    </section>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<PendingPage title="Dashboard" />}
          />
          <Route
            path="/transactions"
            element={<PendingPage title="Transacciones" />}
          />
          <Route
            path="/budgets"
            element={<PendingPage title="Presupuestos" />}
          />
          <Route
            path="/categories"
            element={<PendingPage title="Categorías" />}
          />
          <Route
            path="/reports"
            element={<PendingPage title="Informes" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
