import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemTools } from "@/services/tools";

export const metadata = { title: "Integrations" };

const integrations = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Check availability and book appointments.",
    status: "available",
  },
  {
    id: "outlook_calendar",
    name: "Microsoft Outlook Calendar",
    description: "Sync scheduling with Outlook calendars.",
    status: "available",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Push leads and call outcomes into HubSpot CRM.",
    status: "available",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Create and update Salesforce leads and contacts.",
    status: "available",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Trigger Zaps from call and lead events.",
    status: "available",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Signed HTTP callbacks for platform events.",
    status: "available",
  },
  {
    id: "custom_rest",
    name: "Custom REST API",
    description: "Register custom tools against your own endpoints.",
    status: "available",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect calendars, CRM systems, and custom tools. Credentials are encrypted at rest."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>{integration.name}</CardTitle>
              <Badge tone="info">{integration.status}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-ink-muted)]">
              {integration.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool registry</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {systemTools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <div className="font-medium">{tool.displayName}</div>
              <div className="text-[var(--color-ink-muted)]">{tool.description}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
