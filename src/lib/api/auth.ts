import { createHash } from "crypto";

import { isDemoMode } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type ApiAuthResult =
  | {
      ok: true;
      organizationId: string;
      apiKeyId: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function authenticateApiRequest(request: Request): Promise<ApiAuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const apiKey = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : request.headers.get("x-api-key")?.trim();

  if (!apiKey) {
    return { ok: false, status: 401, error: "Missing API key" };
  }

  const limited = rateLimit(`api:${apiKey.slice(0, 12)}`, 120, 60_000);
  if (!limited.success) {
    return { ok: false, status: 429, error: "Rate limit exceeded" };
  }

  if (isDemoMode()) {
    if (apiKey === "demo_agentel_key" || apiKey.startsWith("ak_demo_")) {
      return {
        ok: true,
        organizationId: "00000000-0000-4000-8000-000000000001",
        apiKeyId: "demo",
      };
    }
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  const hash = createHash("sha256").update(apiKey).digest("hex");
  const prefix = apiKey.slice(0, 8);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, organization_id, revoked_at")
    .eq("key_prefix", prefix)
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data || data.revoked_at) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    ok: true,
    organizationId: data.organization_id,
    apiKeyId: data.id,
  };
}
