import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth/session";
import { listLeads } from "@/services/leads";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const auth = await requireAuthContext();
  const leads = await listLeads(auth.activeOrganization.organization.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="CRM-style view of leads captured by AI voice agents."
      />
      <Card>
        <CardContent className="overflow-x-auto px-0 py-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Telephone</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Interest</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-medium">{lead.name ?? "—"}</td>
                  <td className="px-5 py-3">{lead.phone ?? "—"}</td>
                  <td className="px-5 py-3">{lead.email ?? "—"}</td>
                  <td className="px-5 py-3">{lead.company ?? "—"}</td>
                  <td className="px-5 py-3">{lead.interest ?? "—"}</td>
                  <td className="px-5 py-3">{lead.qualification_score ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge>{lead.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
