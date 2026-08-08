import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Outbound calls" };

export default function OutboundPage() {
  return (
    <ModulePlaceholder
      title="Outbound calls"
      description="Launch AI-powered one-to-one outbound calls with purpose and optional instructions."
      phase="Phase 3"
      bullets={[
        "Select agent, customer, number, and purpose",
        "Logged into call history",
        "Campaign architecture reserved; no bulk spam calling",
      ]}
    />
  );
}
