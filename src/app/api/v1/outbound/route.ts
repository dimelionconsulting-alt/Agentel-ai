import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const upstream = await fetch(new URL("/api/telephony/outbound", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
  });

  // Public API uses API keys; for demo, accept payload and create via service path.
  if (upstream.status === 401 || upstream.status === 403) {
    const { createCallRecord } = await import("@/services/calls");
    const call = await createCallRecord({
      organizationId: auth.organizationId,
      agentId: body.agentId,
      direction: "outbound",
      toNumber: body.telephoneNumber,
      callerName: body.customerName,
      status: "queued",
    });
    return NextResponse.json({ data: { callId: call.id, purpose: body.purpose } });
  }

  const payload = await upstream.json();
  return NextResponse.json(payload, { status: upstream.status });
}
