export interface ReportPeriod {
  year: number;
  month: number;
}

export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  transactionsCount: number;
}

export interface ExpenseCategoryReport {
  categoryId: string | null;
  name: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyFinancialReport {
  period: ReportPeriod;
  summary: FinancialSummary;
  expenseCategories: ExpenseCategoryReport[];
}

export interface FinancialEvolutionMonth {
  year: number;
  month: number;
  income: number;
  expenses: number;
  balance: number;
  transactionsCount: number;
}

export interface FinancialEvolutionReport {
  year: number;
  month: number;
  months: number;
  data: FinancialEvolutionMonth[];
}