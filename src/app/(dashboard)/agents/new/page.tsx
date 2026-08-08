import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Agent builder",
};

const steps = [
  "Agent identity",
  "Voice and language",
  "Agent instructions",
  "Business knowledge",
  "Tools and integrations",
  "Telephone number",
  "Test agent",
  "Publish",
];

export default function NewAgentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Builder"
        description="Visual multi-step builder scaffold. Interactive configuration and browser test call arrive in Phase 2–3."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step} className="metric-card" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge tone="info">Step {index + 1}</Badge>
                {index === 0 ? <Badge tone="success">Ready</Badge> : <Badge>Planned</Badge>}
              </div>
              <CardTitle className="mt-3 text-base">{step}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--color-ink-muted)]">
              {index === 6
                ? "Includes a browser-based Test Agent flow before assigning a phone number."
                : "Configured against the agents schema and provider abstractions."}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
