import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types";

export async function listLeads(organizationId: string): Promise<Lead[]> {
  if (isDemoMode()) {
    return getDemoStore().leads.filter((lead) => lead.organization_id === organizationId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}
