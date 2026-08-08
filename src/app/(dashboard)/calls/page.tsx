import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth/session";
import { listAgents } from "@/services/agents";
import { listCalls } from "@/services/calls";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Calls" };

function statusTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "missed" || status === "failed") return "danger" as const;
  if (status === "transferred") return "warning" as const;
  return "neutral" as const;
}

export default async function CallsPage() {
  const auth = await requireAuthContext();
  const organizationId = auth.activeOrganization.organization.id;
  const [calls, agents] = await Promise.all([
    listCalls(organizationId),
    listAgents(organizationId),
  ]);

  const agentName = new Map(agents.map((agent) => [agent.id, agent.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calls"
        description="Inbound and outbound call history with transcripts and outcomes."
        actions={
          <Link
            href="/outbound"
            className="inline-flex h-10 items-center rounded-lg bg-[var(--color-accent)] px-4 text-sm font-medium text-white"
          >
            New outbound call
          </Link>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto px-0 py-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Caller</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Direction</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                    {call.started_at ? new Date(call.started_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/calls/${call.id}`}
                      className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                    >
                      {call.direction === "inbound"
                        ? call.from_number ?? "Unknown"
                        : call.to_number ?? "Unknown"}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {call.agent_id ? agentName.get(call.agent_id) ?? "—" : "—"}
                  </td>
                  <td className="px-5 py-3 capitalize">{call.direction}</td>
                  <td className="px-5 py-3">{formatDuration(call.duration_seconds)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone(call.status)}>{call.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                    {call.outcome?.replaceAll("_", " ") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
