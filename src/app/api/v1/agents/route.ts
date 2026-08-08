import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";
import { listAgents } from "@/services/agents";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const agents = await listAgents(auth.organizationId);
  return NextResponse.json({ data: agents });
}
