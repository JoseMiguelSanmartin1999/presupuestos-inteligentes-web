import { Navigate, Route, Routes } from "react-router";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { LoginPage } from "@/features/auth/pages/login-page";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { TransactionsPage } from "@/features/transactions/pages/transactions-page";
import { BudgetsPage } from "@/features/budgets/pages/budgets-page";
import { CategoriesPage } from "@/features/categories/pages/categories-page";
import { ReportsPage } from "@/features/reports/pages/reports-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}
