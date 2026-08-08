import { redirect } from "next/navigation";

import { isDemoMode } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createOrganizationForUser } from "@/services/organizations";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  if (isDemoMode()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    redirect("/dashboard");
  }

  try {
    await createOrganizationForUser({
      userId: user.id,
      email: user.email ?? "",
      fullName: String(user.user_metadata?.full_name ?? "Workspace Owner"),
      organizationName: String(
        user.user_metadata?.organization_name ?? "My Organization",
      ),
    });
    redirect("/dashboard");
  } catch (error) {
    return (
      <AuthShell
        title="Almost there"
        subtitle="We couldn’t finish creating your organization."
      >
        <Alert tone="danger">
          {error instanceof Error ? error.message : "Onboarding failed. Please try again."}
        </Alert>
      </AuthShell>
    );
  }
}
