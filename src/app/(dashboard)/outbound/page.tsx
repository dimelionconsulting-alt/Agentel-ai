import { OutboundCallForm } from "@/components/calls/outbound-call-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth/session";
import { listAgents } from "@/services/agents";

export const metadata = { title: "Outbound calls" };

export default async function OutboundPage() {
  const auth = await requireAuthContext();
  const agents = await listAgents(auth.activeOrganization.organization.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outbound calls"
        description="Launch one-to-one AI-powered outbound calls. Campaign bulk-dialing is intentionally not enabled."
      />
      <Card className="max-w-2xl">
        <CardContent className="py-6">
          <OutboundCallForm agents={agents} />
        </CardContent>
      </Card>
    </div>
  );
}
