import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/config/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "voxora-ai",
    phase: 1,
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
