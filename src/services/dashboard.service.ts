
import { dashboardDemoData } from "@/data/dashboard.demo";
import { apiRequest } from "@/services/api";
import type {
  BudgetSummary,
  DashboardData,
  ExpenseCategory,
  MonthlyActivity,
  Transaction,
  TransactionType,
} from "@/types/dashboard";

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? "demo";

const CATEGORY_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#eab308",
  "#64748b",
];

export interface TransactionSummary {
  year: number;
  month: number;
  totalIncome: string | number;
  totalExpenses: string | number;
  balance: string | number;
}

interface NormalizedTransaction extends Transaction {
  // Fecha normalizada para poder filtrar por mes.
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const object = getObject(payload);

  for (const key of [
    "data",
    "items",
    "transactions",
    "budgets",
    "results",
    "records",
    "content",
  ]) {
    const value = object[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nested = extractArray(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function normalizeType(value: unknown): TransactionType | null {
  const type = String(value ?? "").toLowerCase();

  if (["income", "ingreso", "incomes", "credit"].includes(type)) {
    return "income";
  }

  if (
    ["expense", "gasto", "egreso", "expenses", "debit"].includes(type)
  ) {
    return "expense";
  }

  return null;
}

function normalizeTransaction(
  value: unknown,
  index: number,
): NormalizedTransaction | null {
  const item = getObject(value);

  const categoryObject = getObject(item["category"]);
  const amount =
    toNumber(item["amount"]) ??
    toNumber(item["value"]) ??
    toNumber(item["total"]);

  const type = normalizeType(
    item["type"] ??
      item["transactionType"] ??
      item["transaction_type"] ??
      item["kind"],
  );

  const date = getText(
    item["date"],
    item["transactionDate"],
    item["transaction_date"],
    item["createdAt"],
    item["created_at"],
  );

  if (amount === null || !type || !date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const description =
    getText(
      item["description"],
      item["title"],
      item["name"],
      item["concept"],
    ) || "Movimiento sin descripción";

  const category =
    getText(
      categoryObject["name"],
      item["categoryName"],
      item["category_name"],
      typeof item["category"] === "string" ? item["category"] : "",
    ) || "Sin categoría";

  return {
    id: getText(item["id"], item["uuid"]) || `transaction-${index}`,
    description,
    category,
    date,
    amount: Math.abs(amount),
    type,
  };
}

function normalizeTransactions(payload: unknown): NormalizedTransaction[] {
  return extractArray(payload)
    .map(normalizeTransaction)
    .filter(
      (item): item is NormalizedTransaction => item !== null,
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

function isSameMonth(dateValue: string, year: number, month: number) {
  const date = new Date(dateValue);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month
  );
}

function getCategoryTotals(
  transactions: Transaction[],
): ExpenseCategory[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;

    totals.set(
      transaction.category || "Sin categoría",
      (totals.get(transaction.category || "Sin categoría") ?? 0) +
        Math.abs(transaction.amount),
    );
  }

  return [...totals.entries()]
    .map(([name, amount], index) => ({
      name,
      amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}


function normalizeBudgets(payload: unknown): BudgetSummary[] {
  const response = getObject(payload);

  // GET /budgets/{year}/{month} devuelve las categorías
  // en la propiedad "categories".
  const rows = Array.isArray(response["categories"])
    ? response["categories"]
    : extractArray(payload);

  return rows.flatMap((value, index): BudgetSummary[] => {
    const item = getObject(value);
    const categoryObject = getObject(item["category"]);

    const name =
      getText(
        typeof item["category"] === "string"
          ? item["category"]
          : "",
        categoryObject["name"],
        item["categoryName"],
        item["category_name"],
        item["name"],
        item["title"],
      ) || `Presupuesto ${index + 1}`;

    const limit =
      toNumber(item["budget"]) ??
      toNumber(item["limit"]) ??
      toNumber(item["amount"]) ??
      toNumber(item["budgetAmount"]) ??
      toNumber(item["budget_amount"]) ??
      toNumber(item["plannedAmount"]) ??
      toNumber(item["planned_amount"]);

    const spent =
      toNumber(item["spent"]) ??
      toNumber(item["spentAmount"]) ??
      toNumber(item["spent_amount"]) ??
      toNumber(item["totalSpent"]) ??
      toNumber(item["total_spent"]);

    if (limit === null || limit < 0) {
      return [];
    }

    return [
      {
        name,
        limit,
        spent: spent === null ? 0 : Math.max(0, spent),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      },
    ];
  });
}


function toMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("es-EC", {
    month: "short",
  })
    .format(new Date(year, month - 1, 1))
    .replace(".", "");
}

export async function getTransactionSummary(
  year: number,
  month: number,
): Promise<TransactionSummary> {
  return apiRequest<TransactionSummary>(
    `/transactions/summary/${year}/${month}`,
  );
}

async function getTransactionsSafely(): Promise<NormalizedTransaction[]> {
  try {
    const response = await apiRequest<unknown>("/transactions");
    return normalizeTransactions(response);
  } catch (error) {
    console.warn("No se pudieron cargar las transacciones:", error);
    return [];
  }
}

async function getBudgetsSafely(
  year: number,
  month: number,
): Promise<BudgetSummary[]> {
  try {
    const response = await apiRequest<unknown>(
      `/budgets/${year}/${month}`,
    );

    return normalizeBudgets(response);
  } catch (error) {
    console.warn("No se pudieron cargar los presupuestos:", error);
    return [];
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  if (DATA_SOURCE === "demo") {
    return dashboardDemoData;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // El resumen del mes actual es imprescindible.
  const summary = await getTransactionSummary(year, month);

  const income = toNumber(summary.totalIncome);
  const expenses = toNumber(summary.totalExpenses);
  const balance = toNumber(summary.balance);

  if (income === null || expenses === null || balance === null) {
    throw new Error("La API devolvió importes financieros inválidos.");
  }

  const [transactions, budgets] = await Promise.all([
    getTransactionsSafely(),
    getBudgetsSafely(year, month),
  ]);

  const currentMonthTransactions = transactions.filter((transaction) =>
    isSameMonth(transaction.date, year, month),
  );

  // El resumen del servidor sigue siendo la fuente oficial de los totales.
  const recentTransactions: Transaction[] = currentMonthTransactions.slice(
    0,
    5,
  );

  const expenseCategories = getCategoryTotals(currentMonthTransactions);

  // Consultamos hasta seis meses para construir el histórico real.
  const requestedMonths: { year: number; month: number }[] = [];

  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(year, month - 1 - offset, 1);

    requestedMonths.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  const historicalActivity = await Promise.all(
    requestedMonths.map(async (period): Promise<MonthlyActivity | null> => {
      if (period.year === year && period.month === month) {
        return {
          month: toMonthLabel(period.year, period.month),
          income,
          expenses,
        };
      }

      try {
        const result = await getTransactionSummary(
          period.year,
          period.month,
        );

        const historicalIncome = toNumber(result.totalIncome);
        const historicalExpenses = toNumber(result.totalExpenses);

        if (historicalIncome === null || historicalExpenses === null) {
          return null;
        }

        return {
          month: toMonthLabel(period.year, period.month),
          income: historicalIncome,
          expenses: historicalExpenses,
        };
      } catch (error) {
        console.warn(
          `No se pudo cargar el resumen ${period.year}-${period.month}:`,
          error,
        );

        return null;
      }
    }),
  );

  const monthlyActivity = historicalActivity.filter(
    (item): item is MonthlyActivity => item !== null,
  );

  return {
    balance,
    income,
    expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    monthlyActivity,
    expenseCategories,
    budgets,
    recentTransactions,
  };
}
