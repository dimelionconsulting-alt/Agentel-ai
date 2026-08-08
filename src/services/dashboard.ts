import { isDemoMode } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  format: "number" | "duration" | "currency" | "percent";
  hint?: string;
}

export interface RecentCallRow {
  id: string;
  date: string;
  caller: string;
  agent: string;
  direction: "inbound" | "outbound";
  durationSeconds: number;
  status: string;
  outcome: string | null;
}

export interface UsagePoint {
  date: string;
  inbound: number;
  outbound: number;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  recentCalls: RecentCallRow[];
  usageSeries: UsagePoint[];
}

const demoDashboard: DashboardData = {
  metrics: [
    { key: "total_calls", label: "Total calls", value: 1284, format: "number" },
    { key: "inbound_calls", label: "Inbound calls", value: 942, format: "number" },
    { key: "outbound_calls", label: "Outbound calls", value: 342, format: "number" },
    { key: "answered_calls", label: "Answered calls", value: 1108, format: "number" },
    { key: "missed_calls", label: "Missed calls", value: 76, format: "number" },
    { key: "ai_handled", label: "AI-handled calls", value: 986, format: "number" },
    { key: "transferred", label: "Transferred to humans", value: 122, format: "number" },
    { key: "total_minutes", label: "Total call minutes", value: 4820, format: "number" },
    { key: "avg_duration", label: "Average duration", value: 225, format: "duration" },
    { key: "estimated_cost", label: "Estimated cost", value: 184500, format: "currency" },
    { key: "leads", label: "Leads generated", value: 214, format: "number" },
    { key: "appointments", label: "Appointments booked", value: 97, format: "number" },
  ],
  recentCalls: [
    {
      id: "call_1",
      date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      caller: "+1 (415) 555-0132",
      agent: "Front Desk",
      direction: "inbound",
      durationSeconds: 312,
      status: "completed",
      outcome: "appointment_booked",
    },
    {
      id: "call_2",
      date: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
      caller: "+44 20 7946 0958",
      agent: "Sales Qualifier",
      direction: "outbound",
      durationSeconds: 188,
      status: "completed",
      outcome: "lead_captured",
    },
    {
      id: "call_3",
      date: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      caller: "+1 (646) 555-0199",
      agent: "Support Concierge",
      direction: "inbound",
      durationSeconds: 421,
      status: "transferred",
      outcome: "transferred",
    },
    {
      id: "call_4",
      date: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      caller: "+49 30 123456",
      agent: "Front Desk",
      direction: "inbound",
      durationSeconds: 0,
      status: "missed",
      outcome: "no_answer",
    },
  ],
  usageSeries: Array.from({ length: 14 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return {
      date: date.toISOString().slice(0, 10),
      inbound: 40 + ((index * 7) % 23),
      outbound: 12 + ((index * 5) % 17),
    };
  }),
};

export async function getDashboardData(organizationId: string): Promise<DashboardData> {
  if (isDemoMode()) {
    return demoDashboard;
  }

  const supabase = await createClient();
  const { data: calls, error } = await supabase
    .from("calls")
    .select("id, direction, status, outcome, duration_seconds, from_number, to_number, started_at, cost_estimate_cents, agent:agents(name)")
    .eq("organization_id", organizationId)
    .order("started_at", { ascending: false })
    .limit(100);

  if (error || !calls) {
    return {
      metrics: demoDashboard.metrics.map((metric) => ({ ...metric, value: 0 })),
      recentCalls: [],
      usageSeries: [],
    };
  }

  const totalCalls = calls.length;
  const inbound = calls.filter((call) => call.direction === "inbound").length;
  const outbound = calls.filter((call) => call.direction === "outbound").length;
  const answered = calls.filter((call) =>
    ["completed", "transferred"].includes(call.status),
  ).length;
  const missed = calls.filter((call) => call.status === "missed").length;
  const transferred = calls.filter((call) => call.status === "transferred").length;
  const aiHandled = answered - transferred;
  const totalSeconds = calls.reduce((sum, call) => sum + (call.duration_seconds ?? 0), 0);
  const avgDuration = totalCalls ? Math.round(totalSeconds / totalCalls) : 0;
  const estimatedCost = calls.reduce(
    (sum, call) => sum + (call.cost_estimate_cents ?? 0),
    0,
  );

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { count: appointmentsCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return {
    metrics: [
      { key: "total_calls", label: "Total calls", value: totalCalls, format: "number" },
      { key: "inbound_calls", label: "Inbound calls", value: inbound, format: "number" },
      { key: "outbound_calls", label: "Outbound calls", value: outbound, format: "number" },
      { key: "answered_calls", label: "Answered calls", value: answered, format: "number" },
      { key: "missed_calls", label: "Missed calls", value: missed, format: "number" },
      { key: "ai_handled", label: "AI-handled calls", value: Math.max(aiHandled, 0), format: "number" },
      { key: "transferred", label: "Transferred to humans", value: transferred, format: "number" },
      {
        key: "total_minutes",
        label: "Total call minutes",
        value: Math.round(totalSeconds / 60),
        format: "number",
      },
      { key: "avg_duration", label: "Average duration", value: avgDuration, format: "duration" },
      { key: "estimated_cost", label: "Estimated cost", value: estimatedCost, format: "currency" },
      { key: "leads", label: "Leads generated", value: leadsCount ?? 0, format: "number" },
      {
        key: "appointments",
        label: "Appointments booked",
        value: appointmentsCount ?? 0,
        format: "number",
      },
    ],
    recentCalls: calls.slice(0, 8).map((call) => {
      const agentRelation = call.agent as { name?: string } | { name?: string }[] | null;
      const agentName = Array.isArray(agentRelation)
        ? agentRelation[0]?.name
        : agentRelation?.name;

      return {
        id: call.id,
        date: call.started_at ?? new Date().toISOString(),
        caller: call.direction === "inbound" ? call.from_number ?? "Unknown" : call.to_number ?? "Unknown",
        agent: agentName ?? "Unassigned",
        direction: call.direction,
        durationSeconds: call.duration_seconds ?? 0,
        status: call.status,
        outcome: call.outcome,
      };
    }),
    usageSeries: demoDashboard.usageSeries.map((point) => ({
      ...point,
      inbound: 0,
      outbound: 0,
    })),
  };
}
