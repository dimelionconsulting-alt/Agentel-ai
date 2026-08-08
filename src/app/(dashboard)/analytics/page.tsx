import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { requireAuthContext } from "@/lib/auth/session";
import { listAgents } from "@/services/agents";
import { listCalls } from "@/services/calls";
import { listLeads } from "@/services/leads";
import { formatCurrency, formatDuration, formatNumber, formatPercent } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const auth = await requireAuthContext();
  const organizationId = auth.activeOrganization.organization.id;

  const [calls, agents, leads] = await Promise.all([
    listCalls(organizationId),
    listAgents(organizationId),
    listLeads(organizationId),
  ]);

  const to = params.to ? new Date(params.to) : new Date("2026-08-08T23:59:59.000Z");
  const from = params.from
    ? new Date(params.from)
    : new Date(to.getTime() - 1000 * 60 * 60 * 24 * 30);

  const filtered = calls.filter((call) => {
    if (!call.started_at) return false;
    const started = new Date(call.started_at);
    return started >= from && started <= to;
  });

  const answered = filtered.filter((call) =>
    ["completed", "transferred"].includes(call.status),
  ).length;
  const transferred = filtered.filter((call) => call.status === "transferred").length;
  const totalSeconds = filtered.reduce((sum, call) => sum + call.duration_seconds, 0);
  const cost = filtered.reduce((sum, call) => sum + call.cost_estimate_cents, 0);
  const appointments = filtered.filter((call) => call.outcome === "appointment_booked").length;

  const usageSeries = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    const dayCalls = filtered.filter((call) => call.started_at?.slice(0, 10) === key);
    return {
      date: key,
      inbound: dayCalls.filter((call) => call.direction === "inbound").length,
      outbound: dayCalls.filter((call) => call.direction === "outbound").length,
    };
  });

  const byAgent = agents.map((agent) => {
    const agentCalls = filtered.filter((call) => call.agent_id === agent.id);
    return {
      name: agent.name,
      calls: agentCalls.length,
      minutes: Math.round(
        agentCalls.reduce((sum, call) => sum + call.duration_seconds, 0) / 60,
      ),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Call volume, resolution, transfers, appointments, leads, and costs."
      />

      <form className="flex flex-wrap gap-3">
        <input
          type="date"
          name="from"
          defaultValue={from.toISOString().slice(0, 10)}
          className="h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
        />
        <input
          type="date"
          name="to"
          defaultValue={to.toISOString().slice(0, 10)}
          className="h-10 rounded-lg border border-[var(--color-border)] px-3 text-sm"
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-[var(--color-accent)] px-4 text-sm font-medium text-white"
        >
          Apply dates
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Call volume</p>
            <p className="mt-1 text-2xl font-semibold">{formatNumber(filtered.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Average duration</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatDuration(filtered.length ? Math.round(totalSeconds / filtered.length) : 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Human transfer %</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatPercent(answered ? (transferred / answered) * 100 : 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Costs</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(cost)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Successful resolutions</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatNumber(filtered.filter((call) => call.outcome === "resolved").length)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Appointments</p>
            <p className="mt-1 text-2xl font-semibold">{formatNumber(appointments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Leads</p>
            <p className="mt-1 text-2xl font-semibold">{formatNumber(leads.length)}</p>
          </CardContent>
        </Card>
      </div>

      <UsageChart data={usageSeries} />

      <Card>
        <CardHeader>
          <CardTitle>Usage by agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {byAgent.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span>{row.name}</span>
              <span className="text-[var(--color-ink-muted)]">
                {row.calls} calls · {row.minutes} min
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
