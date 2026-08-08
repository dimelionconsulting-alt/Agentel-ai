import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import type { RecentCallRow } from "@/services/dashboard";

function statusTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "missed" || status === "failed") return "danger" as const;
  if (status === "transferred") return "warning" as const;
  return "neutral" as const;
}

export function RecentCallsTable({ calls }: { calls: RecentCallRow[] }) {
  return (
    <Card className="animate-fade-up delay-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent calls</CardTitle>
        <Link href="/calls" className="text-sm font-medium text-[var(--color-accent)]">
          View all
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-y border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]">
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
                  {new Date(call.date).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <Link href={`/calls/${call.id}`} className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                    {call.caller}
                  </Link>
                </td>
                <td className="px-5 py-3">{call.agent}</td>
                <td className="px-5 py-3 capitalize">{call.direction}</td>
                <td className="px-5 py-3">{formatDuration(call.durationSeconds)}</td>
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
  );
}
