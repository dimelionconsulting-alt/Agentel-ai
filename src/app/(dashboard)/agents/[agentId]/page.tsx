import { notFound } from "next/navigation";

import { AgentBuilder } from "@/components/agents/agent-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAuthContext } from "@/lib/auth/session";
import { agentToFormValues, getAgent } from "@/services/agents";
import { listPhoneNumbers } from "@/services/phone-numbers";

export const metadata = {
  title: "Agent",
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const auth = await requireAuthContext();
  const organizationId = auth.activeOrganization.organization.id;
  const [agent, phoneNumbers] = await Promise.all([
    getAgent(organizationId, agentId),
    listPhoneNumbers(organizationId),
  ]);

  if (!agent) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={agent.name}
        description={agent.description || "Configure this AI voice agent."}
        actions={<Badge tone={agent.status === "active" ? "success" : "neutral"}>{agent.status}</Badge>}
      />
      <AgentBuilder
        agentId={agent.id}
        initialValues={agentToFormValues(agent)}
        phoneNumbers={phoneNumbers}
      />
    </div>
  );
}
