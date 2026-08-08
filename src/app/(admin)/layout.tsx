import { redirect } from "next/navigation";

import { getAuthContext, isDemoMode } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth.user) {
    redirect("/login");
  }

  if (!auth.user.isPlatformAdmin && !isDemoMode()) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight">Voxora Super Admin</p>
            <p className="text-xs text-slate-400">
              Platform operations — never mix tenant private data in shared views
            </p>
          </div>
          <a href="/dashboard" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to app
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
