import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";
import { listKnowledgeDocuments } from "@/services/knowledge";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const documents = await listKnowledgeDocuments(auth.organizationId);
  return NextResponse.json({ data: documents });
}
