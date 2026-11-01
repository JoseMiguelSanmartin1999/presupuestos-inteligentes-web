export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
}

export interface MonthlyActivity {
  month: string;
  income: number;
  expenses: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
}

export interface BudgetSummary {
  name: string;
  spent: number;
  limit: number;
  color: string;
}

export interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  savingsRate: number;
  monthlyActivity: MonthlyActivity[];
  expenseCategories: ExpenseCategory[];
  budgets: BudgetSummary[];
  recentTransactions: Transaction[];
}