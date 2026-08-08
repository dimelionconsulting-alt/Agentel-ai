import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

const sections = [
  ["Company profile", "Name, timezone, industry, and branding"],
  ["Users", "Invite teammates and manage membership"],
  ["Roles", "Owner, Admin, Agent manager, Viewer"],
  ["Billing", "Plan, invoices, and payment methods"],
  ["API keys", "Organization-scoped developer credentials"],
  ["Webhooks", "Signed event delivery endpoints"],
  ["Security", "Sessions, audit logs, and access controls"],
  ["Data retention", "GDPR retention windows"],
  ["Call recording", "Consent and recording toggles"],
  ["Privacy", "Export, deletion, and transcript retention"],
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Organization settings shell for Phase 1. Detailed editors land with later modules."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-ink-muted)]">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
