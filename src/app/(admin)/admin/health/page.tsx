export const metadata = { title: "Admin · System health" };

export default function AdminHealthPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">System health</h1>
      <p className="max-w-2xl text-sm text-slate-400">
        Platform health, telephony provider status, and voice gateway checks will
        appear here in Phase 7.
      </p>
    </div>
  );
}
