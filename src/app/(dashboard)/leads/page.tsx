import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <ModulePlaceholder
      title="Leads"
      description="CRM-style lead capture from AI voice conversations."
      phase="Phase 6"
      bullets={[
        "Name, phone, email, company, interest, notes",
        "Qualification scoring",
        "Linked call and agent attribution",
      ]}
    />
  );
}
