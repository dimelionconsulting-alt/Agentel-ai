import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <ModulePlaceholder
      title="Integrations"
      description="Marketplace for calendars, CRM systems, Zapier, webhooks, and custom APIs."
      phase="Phase 6"
      bullets={[
        "Google Calendar and Outlook",
        "HubSpot and Salesforce",
        "Encrypted credential storage and tool registry",
      ]}
    />
  );
}
