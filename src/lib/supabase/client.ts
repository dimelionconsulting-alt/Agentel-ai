import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/config/env";

export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
