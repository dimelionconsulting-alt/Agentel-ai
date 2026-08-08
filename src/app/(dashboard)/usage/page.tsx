import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Usage" };

export default function UsagePage() {
  return (
    <ModulePlaceholder
      title="Usage"
      description="Track included minutes, overages, agents, numbers, and storage."
      phase="Phase 7"
      bullets={[
        "usage_records metrics model",
        "Plan limit awareness",
        "Stripe usage reporting hooks",
      ]}
    />
  );
}
