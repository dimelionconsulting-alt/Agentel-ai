import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Date-filtered performance, conversion, and cost analytics."
      phase="Phase 4"
      bullets={[
        "Call volume and average duration",
        "Agent performance and transfer rate",
        "Usage by agent and telephone number",
      ]}
    />
  );
}
