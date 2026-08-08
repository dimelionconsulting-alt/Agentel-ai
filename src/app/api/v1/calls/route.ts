import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";
import { listCalls } from "@/services/calls";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const calls = await listCalls(auth.organizationId);
  return NextResponse.json({ data: calls });
}
