import { NextResponse } from "next/server";

import { getAgentByPhoneNumber } from "@/services/agents";
import { createCallRecord } from "@/services/calls";
import {
  TwilioTelephonyProvider,
  buildTwilioMediaStreamInstructions,
} from "@/providers/telephony";

export async function POST(request: Request) {
  const form = await request.formData();
  const params = Object.fromEntries(form.entries()) as Record<string, string>;

  const from = params.From ?? "";
  const to = params.To ?? "";
  const callSid = params.CallSid ?? "";

  if (process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VALIDATE_SIGNATURE === "true") {
    const signature = request.headers.get("x-twilio-signature") ?? "";
    const provider = new TwilioTelephonyProvider({
      accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
      authToken: process.env.TWILIO_AUTH_TOKEN,
    });
    const valid = provider.verifyWebhookSignature(signature, request.url, params);
    if (!valid) {
      return new NextResponse("Invalid signature", { status: 403 });
    }
  }

  const agent = await getAgentByPhoneNumber(to);
  if (!agent || agent.status !== "active") {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, no active agent is available for this number.</Say>
  <Hangup />
</Response>`;
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  await createCallRecord({
    organizationId: agent.organization_id,
    agentId: agent.id,
    direction: "inbound",
    fromNumber: from,
    toNumber: to,
    providerCallSid: callSid,
    status: "in_progress",
  });

  const gatewayBase =
    process.env.VOICE_GATEWAY_WS_URL ??
    process.env.NEXT_PUBLIC_VOICE_GATEWAY_WS_URL ??
    "wss://localhost:8081/streams";

  const streamUrl = `${gatewayBase}?agentId=${encodeURIComponent(agent.id)}&callSid=${encodeURIComponent(callSid)}`;

  const twiml = buildTwilioMediaStreamInstructions({
    streamUrl,
    track: "inbound_track",
  });

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
