import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  FinancialEvolutionMonth,
} from "../types/report.types";

interface FinancialEvolutionChartProps {
  data: FinancialEvolutionMonth[];
}

const months = [
  "Ene", "Feb", "Mar", "Abr",
  "May", "Jun", "Jul", "Ago",
  "Sep", "Oct", "Nov", "Dic",
];

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

export function FinancialEvolutionChart({
  data,
}: FinancialEvolutionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: `${months[item.month - 1] ?? item.month} ${String(item.year).slice(-2)}`,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="min-w-0 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Ingresos vs. gastos
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Comparación de movimientos por mes.
        </p>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="label" />

              <YAxis
                width={55}
                tickFormatter={(value: number) =>
                  `$${value}`
                }
              />

              <Tooltip
                formatter={(value, name) => [
                  currency.format(Number(value ?? 0)),
                  String(name),
                ]}
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Ingresos"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="expenses"
                name="Gastos"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="min-w-0 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Evolución del balance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Diferencia entre ingresos y gastos.
        </p>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="label" />

              <YAxis
                width={55}
                tickFormatter={(value: number) =>
                  `$${value}`
                }
              />

              <Tooltip
                formatter={(value, name) => [
                  currency.format(Number(value ?? 0)),
                  String(name),
                ]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

