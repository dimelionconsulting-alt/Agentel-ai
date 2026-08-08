import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";
import { listLeads } from "@/services/leads";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const leads = await listLeads(auth.organizationId);
  return NextResponse.json({ data: leads });
}
