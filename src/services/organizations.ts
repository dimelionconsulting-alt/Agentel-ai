import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types";

export async function createOrganizationForUser(input: {
  userId: string;
  fullName: string;
  organizationName: string;
  email: string;
}): Promise<Organization> {
  const supabase = await createClient();
  const baseSlug = slugify(input.organizationName) || "organization";
  const slug = `${baseSlug}-${input.userId.slice(0, 8)}`;

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: input.organizationName,
      slug,
      timezone: "UTC",
    })
    .select("*")
    .single<Organization>();

  if (organizationError || !organization) {
    throw new Error(organizationError?.message ?? "Unable to create organization");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: input.userId,
    email: input.email,
    full_name: input.fullName,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organization.id,
    user_id: input.userId,
    role: "owner",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  const { error: settingsError } = await supabase.from("organization_settings").insert({
    organization_id: organization.id,
  });

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").insert({
    organization_id: organization.id,
    plan: "starter",
    status: "trialing",
    included_minutes: 500,
    extra_minute_price_cents: 12,
    max_agents: 2,
    max_phone_numbers: 2,
    knowledge_storage_mb: 250,
  });

  if (subscriptionError) {
    throw new Error(subscriptionError.message);
  }

  return organization;
}
