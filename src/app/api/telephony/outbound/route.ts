import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthContext } from "@/lib/auth/session";
import { createTelephonyProvider } from "@/providers/telephony";
import { getAgent } from "@/services/agents";
import { createCallRecord } from "@/services/calls";
import { listPhoneNumbers } from "@/services/phone-numbers";

const schema = z.object({
  agentId: z.string().uuid(),
  customerName: z.string().min(1).max(120),
  telephoneNumber: z.string().min(5).max(32),
  purpose: z.string().min(1).max(500),
  instructions: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAuthContext();
  const organizationId = auth.activeOrganization.organization.id;
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const agent = await getAgent(organizationId, parsed.data.agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const numbers = await listPhoneNumbers(organizationId);
  const from =
    agent.phoneNumbers[0]?.e164 ??
    numbers.find((phone) => phone.outbound_caller_id_enabled)?.e164;

  if (!from) {
    return NextResponse.json(
      { error: "No outbound caller ID configured" },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/telephony/voice/inbound`;
  const statusCallbackUrl = `${appUrl}/api/telephony/voice/status`;

  let providerCallSid = `demo_${Date.now()}`;
  let status = "queued";

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const telephony = createTelephonyProvider();
    const result = await telephony.placeOutboundCall({
      from,
      to: parsed.data.telephoneNumber,
      webhookUrl,
      statusCallbackUrl,
      callerId: from,
    });
    providerCallSid = result.providerCallSid;
    status = result.status;
  }

  const call = await createCallRecord({
    organizationId,
    agentId: agent.id,
    phoneNumberId: agent.phoneNumbers[0]?.id ?? null,
    direction: "outbound",
    fromNumber: from,
    toNumber: parsed.data.telephoneNumber,
    callerName: parsed.data.customerName,
    providerCallSid,
    status: status === "queued" ? "queued" : "ringing",
  });

  return NextResponse.json({
    ok: true,
    callId: call.id,
    providerCallSid,
    purpose: parsed.data.purpose,
    instructions: parsed.data.instructions ?? null,
  });
}
