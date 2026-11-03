import type {
  MonthlyFinancialReport,
  FinancialEvolutionReport,
} from "../types/report.types";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function escapeCsv(value: string | number): string {
  const text = String(value);

  // Evita que Excel interprete valores de texto como fórmulas.
  const safeText = /^[\s]*[=+\-@\t\r\n]/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replace(/"/g, '""')}"`;
}

function csvRow(values: Array<string | number>): string {
  return values.map(escapeCsv).join(",");
}

export function exportFinancialReportCsv(
  report: MonthlyFinancialReport,
  evolution: FinancialEvolutionReport,
): void {
  const { year, month } = report.period;
  const { summary, expenseCategories } = report;

  const rows: string[] = [];

  rows.push(
    csvRow(["REPORTE FINANCIERO"]),
    csvRow([
      "Período",
      `${monthNames[month - 1]} ${year}`,
    ]),
    "",
  );

  // Sección 1: resumen financiero.
  rows.push(
    csvRow(["RESUMEN MENSUAL"]),
    csvRow(["Indicador", "Valor"]),
    csvRow(["Ingresos", summary.income]),
    csvRow(["Gastos", summary.expenses]),
    csvRow(["Balance", summary.balance]),
    csvRow(["Tasa de ahorro (%)", summary.savingsRate]),
    csvRow([
      "Total de movimientos",
      summary.transactionsCount,
    ]),
    "",
  );

  // Sección 2: gastos por categoría.
  rows.push(
    csvRow(["GASTOS POR CATEGORÍA"]),
    csvRow([
      "Categoría",
      "Importe (USD)",
      "Porcentaje (%)",
      "Movimientos",
    ]),
  );

  for (const category of expenseCategories) {
    rows.push(
      csvRow([
        category.name,
        category.amount,
        category.percentage,
        category.count,
      ]),
    );
  }

  rows.push("");

  // Sección 3: evolución financiera.
  rows.push(
    csvRow(["EVOLUCIÓN FINANCIERA"]),
    csvRow([
      "Año",
      "Mes",
      "Ingresos (USD)",
      "Gastos (USD)",
      "Balance (USD)",
      "Movimientos",
    ]),
  );

  for (const item of evolution.data) {
    rows.push(
      csvRow([
        item.year,
        monthNames[item.month - 1] ?? item.month,
        item.income,
        item.expenses,
        item.balance,
        item.transactionsCount,
      ]),
    );
  }

  // BOM UTF-8 para compatibilidad con Excel.
  const csvContent = `\uFEFF${rows.join("\r\n")}`;

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `reporte-financiero-${year}-${String(
    month,
  ).padStart(2, "0")}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}   