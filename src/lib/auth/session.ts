import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import type {
  ActiveOrganizationContext,
  AuthContext,
  AuthSessionUser,
  Organization,
  OrganizationMember,
  UserProfile,
} from "@/types";

const demoOrganization: Organization = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Voxora Demo",
  slug: "voxora-demo",
  website: "https://voxora.ai",
  industry: "Software",
  timezone: "UTC",
  logo_url: null,
  recording_enabled: true,
  recording_consent_required: true,
  data_retention_days: 365,
  transcript_retention_days: 365,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !isSupabaseConfigured();
}

export async function getAuthContext(): Promise<AuthContext> {
  if (isDemoMode()) {
    const user: AuthSessionUser = {
      id: "00000000-0000-4000-8000-000000000099",
      email: "owner@voxora.demo",
      emailVerified: true,
      fullName: "Demo Owner",
      avatarUrl: null,
      isPlatformAdmin: true,
    };

    const activeOrganization: ActiveOrganizationContext = {
      organization: demoOrganization,
      role: "owner",
      membershipId: "00000000-0000-4000-8000-000000000010",
    };

    return {
      user,
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: null,
        is_platform_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      organizations: [activeOrganization],
      activeOrganization,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      organizations: [],
      activeOrganization: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfile>();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("*, organization:organizations(*)")
    .eq("user_id", user.id)
    .returns<
      Array<
        OrganizationMember & {
          organization: Organization;
        }
      >
    >();

  const organizations: ActiveOrganizationContext[] = (memberships ?? []).map(
    (membership) => ({
      organization: membership.organization,
      role: membership.role,
      membershipId: membership.id,
    }),
  );

  const sessionUser: AuthSessionUser = {
    id: user.id,
    email: user.email ?? "",
    emailVerified: Boolean(user.email_confirmed_at),
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    isPlatformAdmin: Boolean(profile?.is_platform_admin),
  };

  return {
    user: sessionUser,
    profile: profile ?? null,
    organizations,
    activeOrganization: organizations[0] ?? null,
  };
}

export async function requireAuthContext(): Promise<
  AuthContext & {
    user: AuthSessionUser;
    activeOrganization: ActiveOrganizationContext;
  }
> {
  const context = await getAuthContext();

  if (!context.user) {
    throw new Error("Authentication required");
  }

  if (!context.activeOrganization) {
    throw new Error("Organization membership required");
  }

  return {
    ...context,
    user: context.user,
    activeOrganization: context.activeOrganization,
  };
}
