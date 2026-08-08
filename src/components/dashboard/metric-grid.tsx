import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils";
import type { DashboardMetric } from "@/services/dashboard";

function formatMetric(metric: DashboardMetric): string {
  switch (metric.format) {
    case "currency":
      return formatCurrency(metric.value);
    case "duration":
      return formatDuration(metric.value);
    case "percent":
      return `${metric.value.toFixed(1)}%`;
    default:
      return formatNumber(metric.value);
  }
}

export function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card
          key={metric.key}
          className="metric-card"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <CardContent className="py-5">
            <p className="text-sm text-[var(--color-ink-muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {formatMetric(metric)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
