import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: number;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconClassName = "bg-blue-50 text-blue-600",
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>

          <div className={`rounded-xl p-3 ${iconClassName}`}>
            <Icon size={20} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
          {trend !== undefined && (
            <span
              className={
                trend >= 0
                  ? "inline-flex items-center font-medium text-emerald-600"
                  : "inline-flex items-center font-medium text-rose-600"
              }
            >
              {trend >= 0 ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}