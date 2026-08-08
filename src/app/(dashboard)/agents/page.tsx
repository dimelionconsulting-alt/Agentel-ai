import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Agents",
};

export default function AgentsPage() {
  return (
    <div>
      <PageHeader
        title="AI Agents"
        description="Create and manage voice agents for inbound and outbound conversations."
        actions={
          <Link href="/agents/new">
            <Button>Create agent</Button>
          </Link>
        }
      />
      <EmptyState
        title="No agents yet"
        description="Phase 2 adds the full agent builder. For now, the agents module, status model, and schema are ready."
        action={
          <Link href="/agents/new">
            <Button>Open agent builder</Button>
          </Link>
        }
      />
    </div>
  );
}
