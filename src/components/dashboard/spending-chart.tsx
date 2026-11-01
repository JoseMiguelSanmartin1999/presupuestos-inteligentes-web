
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MonthlyActivity } from "@/types/dashboard";
import { ChartNoAxesCombined } from "lucide-react";

const currency = (value: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface SpendingChartProps {
  data: MonthlyActivity[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const validData = data.filter(
    (item) =>
      typeof item.month === "string" &&
      Number.isFinite(item.income) &&
      Number.isFinite(item.expenses),
  );

  const hasActivity = validData.some(
    (item) => item.income !== 0 || item.expenses !== 0,
  );

  return (
    <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Actividad financiera
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Comparación de ingresos y gastos por mes
            </p>
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ChartNoAxesCombined size={20} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {validData.length === 0 || !hasActivity ? (
          <div className="flex min-h-[290px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ChartNoAxesCombined size={23} />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {validData.length === 0
                ? "Historial no disponible"
                : "Todavía no hay actividad financiera"}
            </p>

            <p className="mt-1 max-w-xs text-sm leading-5 text-slate-500">
              {validData.length === 0
                ? "Cuando la API devuelva resúmenes mensuales, podrás comparar tus ingresos y gastos."
                : "Registra ingresos o gastos para comenzar a visualizar tu evolución financiera."}
            </p>
          </div>
        ) : (
          <div
            className="h-[290px] w-full"
            role="img"
            aria-label="Gráfico de líneas que compara ingresos y gastos mensuales"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={validData}
                margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={12}
                />

                <YAxis
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("es-EC", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  allowDecimals
                />

                <Tooltip
                  formatter={(value) => currency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
                    fontSize: 12,
                  }}
                  labelStyle={{
                    color: "#0f172a",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  name="Ingresos"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Gastos"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#ea580c", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
