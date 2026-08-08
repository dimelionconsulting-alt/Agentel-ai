import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentCallsTable } from "@/components/dashboard/recent-calls-table";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { PageHeader } from "@/components/shared/page-header";
import { requireAuthContext } from "@/lib/auth/session";
import { getDashboardData } from "@/services/dashboard";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const auth = await requireAuthContext();
  const data = await getDashboardData(auth.activeOrganization.organization.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Operational overview for ${auth.activeOrganization.organization.name}.`}
      />
      <MetricGrid metrics={data.metrics} />
      <UsageChart data={data.usageSeries} />
      <RecentCallsTable calls={data.recentCalls} />
    </div>
  );
}
