import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getAuthContext, isDemoMode } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth.user) {
    redirect("/login");
  }

  if (!auth.activeOrganization) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      organizationName={auth.activeOrganization.organization.name}
      userName={auth.user.fullName ?? auth.user.email}
      userEmail={auth.user.email}
      role={auth.activeOrganization.role}
      demoMode={isDemoMode()}
    >
      {children}
    </DashboardShell>
  );
}
