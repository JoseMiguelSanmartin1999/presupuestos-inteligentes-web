import { apiRequest } from "@/services/api";

import type {
  MonthlyFinancialReport,
  FinancialEvolutionReport,
} from "@/features/reports/types/report.types";

export async function getMonthlyFinancialReport(
  year: number,
  month: number,
): Promise<MonthlyFinancialReport> {
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2200 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("El período seleccionado no es válido.");
  }

  const response = await apiRequest<MonthlyFinancialReport>(
    `/reports/summary?year=${year}&month=${month}`,
  );

  if (
    !response ||
    !response.period ||
    !response.summary ||
    !Array.isArray(response.expenseCategories)
  ) {
    throw new Error(
      "La API devolvió un formato de reporte inesperado.",
    );
  }

  return response;
}

export async function getFinancialEvolution(
  year: number,
  month: number,
  months = 6,
): Promise<FinancialEvolutionReport> {
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2200 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > 12
  ) {
    throw new Error("El período solicitado no es válido.");
  }

  const response = await apiRequest<FinancialEvolutionReport>(
    `/reports/evolution?year=${year}&month=${month}&months=${months}`,
  );

  if (
    !response ||
    !Array.isArray(response.data) ||
    response.data.length !== months
  ) {
    throw new Error(
      "La API devolvió un formato de evolución financiera inesperado.",
    );
  }

  return response;
}