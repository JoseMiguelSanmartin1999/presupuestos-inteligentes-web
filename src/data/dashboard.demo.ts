import type { DashboardData } from "@/types/dashboard";

export const dashboardDemoData: DashboardData = {
  balance: 2840.5,
  income: 3250,
  expenses: 1840.75,
  savingsRate: 43.4,

  monthlyActivity: [
    { month: "May", income: 2800, expenses: 1900 },
    { month: "Jun", income: 3000, expenses: 2150 },
    { month: "Jul", income: 2900, expenses: 1800 },
    { month: "Ago", income: 3200, expenses: 2300 },
    { month: "Sep", income: 3100, expenses: 2050 },
    { month: "Oct", income: 3250, expenses: 1840.75 },
  ],

  expenseCategories: [
    { name: "Vivienda", amount: 650, color: "#2563eb" },
    { name: "Alimentación", amount: 420, color: "#60a5fa" },
    { name: "Transporte", amount: 210, color: "#93c5fd" },
    { name: "Entretenimiento", amount: 180, color: "#bfdbfe" },
    { name: "Otros", amount: 380.75, color: "#dbeafe" },
  ],

  budgets: [
    { name: "Alimentación", spent: 320, limit: 450, color: "#2563eb" },
    { name: "Transporte", spent: 145, limit: 250, color: "#0ea5e9" },
    { name: "Entretenimiento", spent: 180, limit: 200, color: "#8b5cf6" },
    { name: "Compras personales", spent: 95, limit: 180, color: "#64748b" },
  ],

  recentTransactions: [
    {
      id: "tx-001",
      description: "Salario mensual",
      category: "Ingresos",
      date: "2026-10-24",
      amount: 3250,
      type: "income",
    },
    {
      id: "tx-002",
      description: "Supermercado",
      category: "Alimentación",
      date: "2026-10-23",
      amount: 68.45,
      type: "expense",
    },
    {
      id: "tx-003",
      description: "Pago de internet",
      category: "Servicios",
      date: "2026-10-22",
      amount: 32.99,
      type: "expense",
    },
    {
      id: "tx-004",
      description: "Transporte",
      category: "Transporte",
      date: "2026-10-21",
      amount: 18.5,
      type: "expense",
    },
    {
      id: "tx-005",
      description: "Proyecto freelance",
      category: "Ingresos",
      date: "2026-10-20",
      amount: 180,
      type: "income",
    },
  ],
};