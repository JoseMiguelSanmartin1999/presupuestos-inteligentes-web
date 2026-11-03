import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

async function registerUnicodeFont(doc: jsPDF): Promise<void> {
  const response = await fetch("/fonts/DejaVuSans.ttf");

  if (!response.ok) {
    throw new Error(
      "No se pudo cargar la fuente Unicode para el PDF.",
    );
  }

  const buffer = await response.arrayBuffer();

  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];

  const chunkSize = 8192;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);

    chunks.push(
      Array.from(chunk, (byte) =>
        String.fromCharCode(byte),
      ).join(""),
    );
  }

  const binary = chunks.join("");
  const base64 = btoa(binary);

  doc.addFileToVFS("DejaVuSans.ttf", base64);
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
}

type EvolutionItem = FinancialEvolutionReport["data"][number];

const shortMonths = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function drawIncomeExpensesChart(
  doc: jsPDF,
  data: EvolutionItem[],
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const left = x + 15;
  const top = y + 12;
  const plotWidth = width - 22;
  const plotHeight = height - 30;
  const bottom = top + plotHeight;

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.income, item.expenses]),
  );

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Ingresos frente a gastos", x, y + 5);

  // Líneas de referencia.
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue * i) / 4;
    const lineY = bottom - (plotHeight * i) / 4;

    doc.setDrawColor(226, 232, 240);
    doc.line(left, lineY, left + plotWidth, lineY);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `$${value.toFixed(0)}`,
      left - 2,
      lineY + 1,
      { align: "right" },
    );
  }

  if (data.length === 0) return;

  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(5, groupWidth * 0.3);

  data.forEach((item, index) => {
    const center = left + groupWidth * (index + 0.5);

    const incomeHeight =
      (Math.max(0, item.income) / maxValue) * plotHeight;

    const expensesHeight =
      (Math.max(0, item.expenses) / maxValue) * plotHeight;

    doc.setFillColor(22, 163, 74);
    doc.rect(
      center - barWidth - 0.5,
      bottom - incomeHeight,
      barWidth,
      incomeHeight,
      "F",
    );

    doc.setFillColor(249, 115, 22);
    doc.rect(
      center + 0.5,
      bottom - expensesHeight,
      barWidth,
      expensesHeight,
      "F",
    );

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${shortMonths[item.month - 1]} ${String(item.year).slice(-2)}`,
      center,
      bottom + 5,
      { align: "center" },
    );
  });

  // Leyenda.
  doc.setFontSize(8);

  doc.setFillColor(22, 163, 74);
  doc.rect(x + 20, y + height - 5, 3, 3, "F");
  doc.text("Ingresos", x + 25, y + height - 2);

  doc.setFillColor(249, 115, 22);
  doc.rect(x + 65, y + height - 5, 3, 3, "F");
  doc.text("Gastos", x + 70, y + height - 2);
}

function drawBalanceChart(
  doc: jsPDF,
  data: EvolutionItem[],
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const left = x + 15;
  const top = y + 12;
  const plotWidth = width - 22;
  const plotHeight = height - 25;
  const bottom = top + plotHeight;

  const values = data.map((item) => item.balance);

  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = Math.max(1, maxValue - minValue);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Evolución del balance", x, y + 5);

  for (let i = 0; i <= 4; i++) {
    const value = minValue + (range * i) / 4;
    const lineY = bottom - (plotHeight * i) / 4;

    doc.setDrawColor(226, 232, 240);
    doc.line(left, lineY, left + plotWidth, lineY);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `$${value.toFixed(0)}`,
      left - 2,
      lineY + 1,
      { align: "right" },
    );
  }

  if (data.length === 0) return;

  const getX = (index: number) =>
    left +
    (data.length === 1
      ? plotWidth / 2
      : (index / (data.length - 1)) * plotWidth);

  const getY = (value: number) =>
    bottom - ((value - minValue) / range) * plotHeight;

  // Línea del balance.
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);

  for (let i = 1; i < data.length; i++) {
    doc.line(
      getX(i - 1),
      getY(data[i - 1].balance),
      getX(i),
      getY(data[i].balance),
    );
  }

  data.forEach((item, index) => {
    const pointX = getX(index);
    const pointY = getY(item.balance);

    doc.setFillColor(37, 99, 235);
    doc.circle(pointX, pointY, 1.4, "F");

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${shortMonths[item.month - 1]} ${String(item.year).slice(-2)}`,
      pointX,
      bottom + 5,
      { align: "center" },
    );
  });
}

export async function exportFinancialReportPdf(
  report: MonthlyFinancialReport,
  evolution: FinancialEvolutionReport,
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  await registerUnicodeFont(doc);

  const { year, month } = report.period;
  const { summary, expenseCategories } = report;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;

  // Encabezado.
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(18);
  doc.text("PresupuestosInteligentes", margin, 18);

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(11);
  doc.text("Informe financiero mensual", margin, 27);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);

  doc.text(
    `Período: ${monthNames[month - 1]} ${year}`,
    margin,
    51,
  );

  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-EC")}`,
    margin,
    58,
  );

  // Resumen.
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(14);
  doc.text("Resumen financiero", margin, 72);

  autoTable(doc, {
    startY: 78,
    head: [["Indicador", "Valor"]],
    body: [
      ["Ingresos", currency.format(summary.income)],
      ["Gastos", currency.format(summary.expenses)],
      ["Balance", currency.format(summary.balance)],
      ["Tasa de ahorro", `${summary.savingsRate.toFixed(2)}%`],
      ["Movimientos", String(summary.transactionsCount)],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      font: "DejaVuSans",
      fontStyle: "normal",
    },
    margin: { left: margin, right: margin },
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 9,
    },
  });

  let currentY = (doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  }).lastAutoTable?.finalY ?? 115;

  // Gastos por categoría.
  currentY += 13;

  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(14);
  doc.text("Gastos por categoría", margin, currentY);

  autoTable(doc, {
    startY: currentY + 6,
    head: [[
      "Categoría",
      "Importe",
      "Porcentaje",
      "Movimientos",
    ]],
    body:
      expenseCategories.length > 0
        ? expenseCategories.map((category) => [
            category.name,
            currency.format(category.amount),
            `${category.percentage.toFixed(2)}%`,
            String(category.count),
          ])
        : [["Sin gastos registrados", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      font: "DejaVuSans",
      fontStyle: "normal",
    },
    margin: { left: margin, right: margin },
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 9,
    },
  });

  currentY =
    ((doc as jsPDF & {
      lastAutoTable?: { finalY: number };
    }).lastAutoTable?.finalY ?? currentY) + 13;

  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Evolución financiera.
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(14);
  doc.text("Evolución financiera", margin, currentY);

  autoTable(doc, {
    startY: currentY + 6,
    head: [[
      "Mes",
      "Ingresos",
      "Gastos",
      "Balance",
    ]],
    body: evolution.data.map((item) => [
      `${monthNames[item.month - 1]} ${item.year}`,
      currency.format(item.income),
      currency.format(item.expenses),
      currency.format(item.balance),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      font: "DejaVuSans",
      fontStyle: "normal",
    },
    margin: { left: margin, right: margin },
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 9,
    },
  });

  // Gráficas financieras.
  // Se colocan en una página independiente para evitar cortes.
  doc.addPage();

  const chartMargin = 16;
  const chartWidth =
    doc.internal.pageSize.getWidth() - chartMargin * 2;

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("Análisis gráfico", chartMargin, 25);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Evolución de ${evolution.months} meses hasta ${monthNames[month - 1]} ${year}`,
    chartMargin,
    33,
  );

  drawIncomeExpensesChart(
    doc,
    evolution.data,
    chartMargin,
    45,
    chartWidth,
    90,
  );

  drawBalanceChart(
    doc,
    evolution.data,
    chartMargin,
    150,
    chartWidth,
    90,
  );

  // Pie de página.
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.line(
      margin,
      pageHeight - 17,
      pageWidth - margin,
      pageHeight - 17,
    );

    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "PresupuestosInteligentes - Informe financiero",
      margin,
      pageHeight - 11,
    );

    doc.text(
      `Página ${page} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 11,
      { align: "right" },
    );
  }

  doc.save(
    `reporte-financiero-${year}-${String(month).padStart(2, "0")}.pdf`,
  );
}
