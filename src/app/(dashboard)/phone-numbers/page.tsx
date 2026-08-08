import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Phone Numbers" };

export default function PhoneNumbersPage() {
  return (
    <ModulePlaceholder
      title="Phone Numbers"
      description="Purchase, assign, and route telephone numbers across telecom providers."
      phase="Phase 3"
      bullets={[
        "Twilio number purchase and assignment",
        "Inbound routing + outbound caller ID",
        "Provider-agnostic phone_numbers schema for future SIP providers",
      ]}
    />
  );
}
