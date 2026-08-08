import { AgentBuilder } from "@/components/agents/agent-builder";
import { PageHeader } from "@/components/shared/page-header";
import { requireAuthContext } from "@/lib/auth/session";
import { listPhoneNumbers } from "@/services/phone-numbers";

export const metadata = {
  title: "Create agent",
};

export default async function NewAgentPage() {
  const auth = await requireAuthContext();
  const phoneNumbers = await listPhoneNumbers(auth.activeOrganization.organization.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Builder"
        description="Configure identity, voice, instructions, tools, telephony, then test and publish."
      />
      <AgentBuilder phoneNumbers={phoneNumbers} />
    </div>
  );
}
