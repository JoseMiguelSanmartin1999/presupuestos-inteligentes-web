
import { apiRequest } from "@/services/api";

// ============================================================
// TYPES
// ============================================================

export type TransactionType = "INCOME" | "EXPENSE";

export type BudgetPlanStatus = "DRAFT" | "APPROVED";

export interface BudgetCategory {
  id: string;
  name: string;
  color?: string;
}

export interface ApiCategory extends BudgetCategory {
  type: TransactionType;
}

export interface FixedExpense {
  name: string;
  amount: number;
}

export interface GeneratedFixedExpense extends FixedExpense {
  categoryId: string | null;
}

export interface GeneratedBudgetCategory {
  categoryId: string;
  name?: string;
  averageMonthlySpend?: number;
  proposedAmount?: number;
  amount?: number;
}

export interface BudgetPeriod {
  year: number;
  month: number;
}

export interface MonthlyBudget {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  categoryId: string;
  category: BudgetCategory;
  status: string;
}

export interface MonthlyBudgetSummary extends BudgetPeriod {
  hasBudget: boolean;
  summary: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    usagePercent: number;
    categoriesCount: number;
    exceededCategories: number;
  };
  budgets: MonthlyBudget[];
  note?: string;
}

// ============================================================
// GENERATE BUDGET TYPES
// ============================================================

export interface GenerateBudgetRequest {
  monthlyIncome: number;
  savingsGoalPercent: number;
  fixedExpenses: FixedExpense[];
}

export interface GenerateBudgetResponse {
  status: string;

  period: BudgetPeriod & {
    historyMonths: number;
    historyFrom?: string;
    historyTo?: string;
  };

  incomeSource: string;

  summary: {
    monthlyIncome: number;
    savingsGoalPercent: number;
    savingsAmount: number;
    fixedExpensesTotal: number;
    historicalVariableSpend: number;
    variableBudgetTotal: number;
    plannedTotal: number;
    remainingAmount: number;
  };

  fixedExpenses: GeneratedFixedExpense[];
  categories: GeneratedBudgetCategory[];
  warnings: string[];
  requiresReview: boolean;
}

// ============================================================
// LEGACY APPROVAL TYPES
// ============================================================

export interface ApproveBudgetRequest extends BudgetPeriod {
  categories: GeneratedBudgetCategory[];
}

export interface ApproveBudgetResponse {
  message: string;
  period: BudgetPeriod;
  count: number;

  budgets: Array<{
    id: string;
    categoryId: string;
    category: string;
    amount: string | number;
    month: number;
    year: number;
  }>;
}

// ============================================================
// SAVED BUDGET PLAN TYPES
// ============================================================

export interface SaveBudgetPlanCategory {
  categoryId: string;
  amount: number;
}

export interface SaveBudgetPlanRequest extends BudgetPeriod {
  monthlyIncome: number;
  savingsGoalPercent: number;
  fixedExpenses: FixedExpense[];
  categories: SaveBudgetPlanCategory[];
}

export interface SavedFixedExpense {
  id: string;
  name: string;
  amount: string | number;
}

export interface SavedBudgetCategory {
  id: string;
  categoryId: string;
  amount: string | number;
  category: BudgetCategory;
}

export interface SavedBudgetPlan extends BudgetPeriod {
  id: string;
  monthlyIncome: string | number;
  savingsGoalPercent: string | number;
  status: BudgetPlanStatus;
  approvedAt: string | null;
  fixedExpenses: SavedFixedExpense[];
  categories: SavedBudgetCategory[];
}

export interface ApproveSavedBudgetResponse {
  message: string;
  planId: string;
  status: BudgetPlanStatus;
  period: BudgetPeriod;
  categoriesCount: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

type ApiNumber = number | string;

interface BudgetApiResponse {
  period: BudgetPeriod;
  hasBudget: boolean;

  summary: {
    totalBudget: ApiNumber;
    totalSpent: ApiNumber;
    remaining: ApiNumber;
    usagePercent: ApiNumber;
    categoriesCount: ApiNumber;
    exceededCategories: ApiNumber;
  };

  categories: Array<{
    categoryId: string;
    category: string;
    budget: ApiNumber;
    spent: ApiNumber;
    remaining: ApiNumber;
    usagePercent: ApiNumber;
    status: string;
  }>;

  note?: string;
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function validatePeriod(year: number, month: number): void {
  const validYear =
    Number.isInteger(year) &&
    year >= 2000 &&
    year <= 2200;

  const validMonth =
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12;

  if (!validYear || !validMonth) {
    throw new Error(
      "El año o mes seleccionado no es válido.",
    );
  }
}

function validatePlanId(planId: string): void {
  if (!planId || !planId.trim()) {
    throw new Error(
      "El identificador de la propuesta no es válido.",
    );
  }
}

function toNumber(value: unknown, field: string): number {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new Error(
      `El campo "${field}" recibido de la API no es válido.`,
    );
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `El campo "${field}" recibido de la API no es válido.`,
    );
  }

  return parsed;
}

function validateBudgetPlan(data: SaveBudgetPlanRequest): void {
  validatePeriod(data.year, data.month);

  if (
    !Number.isFinite(data.monthlyIncome) ||
    data.monthlyIncome <= 0
  ) {
    throw new Error(
      "Los ingresos mensuales deben ser mayores que cero.",
    );
  }

  if (
    !Number.isFinite(data.savingsGoalPercent) ||
    data.savingsGoalPercent < 0 ||
    data.savingsGoalPercent > 100
  ) {
    throw new Error(
      "La meta de ahorro debe estar entre 0 y 100 %.",
    );
  }

  if (
    !Array.isArray(data.fixedExpenses) ||
    !Array.isArray(data.categories)
  ) {
    throw new Error(
      "Los gastos fijos y las categorías deben ser listas válidas.",
    );
  }

  for (const expense of data.fixedExpenses) {
    if (
      !expense.name?.trim() ||
      !Number.isFinite(expense.amount) ||
      expense.amount < 0
    ) {
      throw new Error(
        "Existe un gasto fijo con datos inválidos.",
      );
    }
  }

  const categoryIds = new Set<string>();

  for (const category of data.categories) {
    if (
      !category.categoryId?.trim() ||
      !Number.isFinite(category.amount) ||
      category.amount <= 0
    ) {
      throw new Error(
        "Existe un presupuesto por categoría inválido.",
      );
    }

    if (categoryIds.has(category.categoryId)) {
      throw new Error(
        "No puedes repetir categorías en una propuesta.",
      );
    }

    categoryIds.add(category.categoryId);
  }

  const fixedTotal = data.fixedExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const categoriesTotal = data.categories.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const savingsAmount =
    (data.monthlyIncome * data.savingsGoalPercent) / 100;

  const plannedTotal =
    savingsAmount + fixedTotal + categoriesTotal;

  // Tolerancia mínima por operaciones con decimales JS.
  if (plannedTotal - data.monthlyIncome > 0.001) {
    throw new Error(
      "El ahorro, los gastos fijos y los presupuestos superan los ingresos mensuales.",
    );
  }
}

// ============================================================
// MAPPERS
// ============================================================

function mapMonthlyBudget(
  item: BudgetApiResponse["categories"][number],
): MonthlyBudget {
  return {
    id: item.categoryId,
    categoryId: item.categoryId,

    amount: toNumber(item.budget, "budget"),
    spent: toNumber(item.spent, "spent"),
    remaining: toNumber(item.remaining, "remaining"),

    usagePercent: toNumber(
      item.usagePercent,
      "usagePercent",
    ),

    category: {
      id: item.categoryId,
      name: item.category,
    },

    status: item.status,
  };
}

function mapMonthlySummary(
  response: BudgetApiResponse,
): MonthlyBudgetSummary["summary"] {
  const summary = response.summary;

  return {
    totalBudget: toNumber(
      summary.totalBudget,
      "summary.totalBudget",
    ),

    totalSpent: toNumber(
      summary.totalSpent,
      "summary.totalSpent",
    ),

    remaining: toNumber(
      summary.remaining,
      "summary.remaining",
    ),

    usagePercent: toNumber(
      summary.usagePercent,
      "summary.usagePercent",
    ),

    categoriesCount: toNumber(
      summary.categoriesCount,
      "summary.categoriesCount",
    ),

    exceededCategories: toNumber(
      summary.exceededCategories,
      "summary.exceededCategories",
    ),
  };
}

function mapMonthlyBudgetResponse(
  response: BudgetApiResponse,
): MonthlyBudgetSummary {
  if (
    !response ||
    !response.summary ||
    !Array.isArray(response.categories)
  ) {
    throw new Error(
      "La API devolvió una estructura de presupuestos inesperada.",
    );
  }

  return {
    year: response.period.year,
    month: response.period.month,
    hasBudget: response.hasBudget,
    summary: mapMonthlySummary(response),
    budgets: response.categories.map(mapMonthlyBudget),
    note: response.note,
  };
}

// ============================================================
// CATEGORY SERVICE
// ============================================================

export async function getExpenseCategories(): Promise<ApiCategory[]> {
  const response = await apiRequest<ApiCategory[]>("/categories");

  if (!Array.isArray(response)) {
    throw new Error(
      "La API devolvió una lista de categorías no válida.",
    );
  }

  return response.filter(
    (category) => category.type === "EXPENSE",
  );
}

// ============================================================
// BUDGET GENERATION
// ============================================================

export async function generateBudget(
  data: GenerateBudgetRequest,
): Promise<GenerateBudgetResponse> {
  return apiRequest<GenerateBudgetResponse>(
    "/budgets/generate",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// LEGACY BUDGET APPROVAL
// ============================================================

// Mantener temporalmente por compatibilidad.
// El nuevo flujo debe usar approveSavedBudgetPlan().
export async function approveBudget(
  data: ApproveBudgetRequest,
): Promise<ApproveBudgetResponse> {
  validatePeriod(data.year, data.month);

  return apiRequest<ApproveBudgetResponse>(
    "/budgets/approve",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// MONTHLY BUDGET PROGRESS
// ============================================================

export async function getMonthlyBudgets(
  year: number,
  month: number,
): Promise<MonthlyBudgetSummary> {
  validatePeriod(year, month);

  const response = await apiRequest<BudgetApiResponse>(
    `/budgets/${year}/${month}`,
  );

  return mapMonthlyBudgetResponse(response);
}

// ============================================================
// BUDGET PLAN MANAGEMENT
// ============================================================

export async function saveBudgetPlan(
  data: SaveBudgetPlanRequest,
): Promise<SavedBudgetPlan> {
  validateBudgetPlan(data);

  return apiRequest<SavedBudgetPlan>(
    "/budget-plans",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function getSavedBudgetPlan(
  year: number,
  month: number,
): Promise<SavedBudgetPlan> {
  validatePeriod(year, month);

  return apiRequest<SavedBudgetPlan>(
    `/budget-plans/${year}/${month}`,
  );
}

export async function approveSavedBudgetPlan(
  planId: string,
): Promise<ApproveSavedBudgetResponse> {
  validatePlanId(planId);

  return apiRequest<ApproveSavedBudgetResponse>(
    `/budget-plans/${encodeURIComponent(planId)}/approve`,
    {
      method: "POST",
    },
  );
}



export interface UpdateApprovedBudgetResponse {
  message: string;
  plan: SavedBudgetPlan;
}

export async function updateApprovedBudgetPlan(
  planId: string,
  data: Omit<SaveBudgetPlanRequest, "year" | "month">,
): Promise<UpdateApprovedBudgetResponse> {
  validatePlanId(planId);

  return apiRequest<UpdateApprovedBudgetResponse>(
    `/budget-plans/${encodeURIComponent(planId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}
