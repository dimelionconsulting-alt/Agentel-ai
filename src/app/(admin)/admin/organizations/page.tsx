export const metadata = { title: "Admin · Organizations" };

export default function AdminOrganizationsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
      <p className="max-w-2xl text-sm text-slate-400">
        Super-admin organizations console scaffold for Phase 7. Aggregated metrics
        only; tenant-private transcripts and recordings stay isolated behind
        explicit org context.
      </p>
    </div>
  );
}
