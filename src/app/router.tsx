
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Carga diferida de páginas
const LoginPage = lazy(() =>
  import("@/features/auth/pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);

const TransactionsPage = lazy(() =>
  import("@/features/transactions/pages/transactions-page").then(
    (module) => ({
      default: module.TransactionsPage,
    }),
  ),
);

const BudgetsPage = lazy(() =>
  import("@/features/budgets/pages/budgets-page").then((module) => ({
    default: module.BudgetsPage,
  })),
);

const CategoriesPage = lazy(() =>
  import("@/features/categories/pages/categories-page").then(
    (module) => ({
      default: module.CategoriesPage,
    }),
  ),
);

const ReportsPage = lazy(() =>
  import("@/features/reports/pages/reports-page").then((module) => ({
    default: module.ReportsPage,
  })),
);

// Pantalla temporal mientras se descarga una página
function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="text-sm font-medium text-slate-500">
          Cargando página...
        </p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              index
              element={<Navigate to="/dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="transactions"
              element={<TransactionsPage />}
            />

            <Route
              path="budgets"
              element={<BudgetsPage />}
            />

            <Route
              path="categories"
              element={<CategoriesPage />}
            />

            <Route
              path="reports"
              element={<ReportsPage />}
            />
          </Route>
        </Route>

        {/* Ruta no encontrada */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Suspense>
  );
}
