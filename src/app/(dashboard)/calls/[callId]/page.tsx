import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth/session";
import { getCallDetail } from "@/services/calls";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const metadata = { title: "Call detail" };

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;
  const auth = await requireAuthContext();
  const call = await getCallDetail(auth.activeOrganization.organization.id, callId);
  if (!call) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={call.caller_name || call.from_number || "Call detail"}
        description={`${call.direction} · ${call.agentName || "Unassigned agent"}`}
        actions={<Badge>{call.status}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Duration</p>
            <p className="mt-1 text-xl font-semibold">{formatDuration(call.duration_seconds)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Sentiment</p>
            <p className="mt-1 text-xl font-semibold capitalize">{call.sentiment ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Intent</p>
            <p className="mt-1 text-xl font-semibold">{call.detected_intent?.replaceAll("_", " ") ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[var(--color-ink-muted)]">Estimated cost</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(call.cost_estimate_cents)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--color-ink-muted)]">
            {call.summary || "Summary will appear after the call completes."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Caller & outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--color-ink-muted)]">
            <p>From: {call.from_number ?? "—"}</p>
            <p>To: {call.to_number ?? "—"}</p>
            <p>Outcome: {call.outcome?.replaceAll("_", " ") ?? "—"}</p>
            <p>Transfer: {call.transferred_to ?? "None"}</p>
            <p>Recording: {call.recording_url ? "Available" : "Disabled / unavailable"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink)]">
            {call.transcript?.content || "Transcript not available yet."}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions performed</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-ink-muted)]">
          {call.actions.length === 0
            ? "No tool actions recorded for this call."
            : call.actions.map((action) => (
                <div key={action.id} className="border-b border-[var(--color-border)] py-2 last:border-0">
                  {action.tool_name || action.action_type} · {action.success ? "success" : "failed"}
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
