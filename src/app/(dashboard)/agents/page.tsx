import Link from "next/link";

import { updateAgentStatusAction } from "@/lib/auth/agent-actions";
import { requireAuthContext } from "@/lib/auth/session";
import { listAgents } from "@/services/agents";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Agents",
};

function statusTone(status: string) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "neutral" as const;
}

export default async function AgentsPage() {
  const auth = await requireAuthContext();
  const agents = await listAgents(auth.activeOrganization.organization.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        description="Create and manage voice agents for inbound and outbound conversations."
        actions={
          <Link href="/agents/new">
            <Button>Create agent</Button>
          </Link>
        }
      />

      {agents.length === 0 ? (
        <EmptyState
          title="No agents yet"
          description="Launch the agent builder to configure identity, voice, tools, and telephony."
          action={
            <Link href="/agents/new">
              <Button>Open agent builder</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.id} className="animate-fade-up">
              <CardContent className="space-y-4 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                    >
                      {agent.name}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {agent.description || "No description"}
                    </p>
                  </div>
                  <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[var(--color-ink-subtle)]">
                  <span>{agent.voice}</span>
                  <span>·</span>
                  <span>{agent.language}</span>
                  <span>·</span>
                  <span>{agent.tools.length} tools</span>
                  <span>·</span>
                  <span>{agent.phoneNumbers[0]?.e164 ?? "No number"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/agents/${agent.id}`}>
                    <Button size="sm" variant="secondary">
                      Configure
                    </Button>
                  </Link>
                  {agent.status !== "active" ? (
                    <form
                      action={async () => {
                        "use server";
                        await updateAgentStatusAction(agent.id, "active");
                      }}
                    >
                      <Button size="sm" type="submit">
                        Activate
                      </Button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await updateAgentStatusAction(agent.id, "paused");
                      }}
                    >
                      <Button size="sm" variant="secondary" type="submit">
                        Pause
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
