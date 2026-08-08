export const metadata = { title: "Admin · Usage" };

export default function AdminUsagePage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
      <p className="max-w-2xl text-sm text-slate-400">
        Cross-tenant usage aggregation scaffold for minutes, agents, numbers, and
        storage. Detailed call content remains organization-scoped.
      </p>
    </div>
  );
}
