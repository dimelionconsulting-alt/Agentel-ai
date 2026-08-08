import { NextResponse } from "next/server";

import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { completeCallRecord } from "@/services/calls";
import { createVoiceAIProvider } from "@/providers/voice-ai";

export async function POST(request: Request) {
  const form = await request.formData();
  const callSid = String(form.get("CallSid") ?? "");
  const callStatus = String(form.get("CallStatus") ?? "");
  const duration = Number(form.get("CallDuration") ?? 0);

  if (!callSid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let organizationId: string | null = null;
  let callId: string | null = null;
  let transcript: string | null = null;

  if (isDemoMode()) {
    const call = getDemoStore().calls.find((item) => item.provider_call_sid === callSid);
    organizationId = call?.organization_id ?? null;
    callId = call?.id ?? null;
    transcript =
      getDemoStore().transcripts.find((item) => item.call_id === callId)?.content ?? null;
  }

  if (!organizationId || !callId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let summary: string | null = null;
  let sentiment: string | null = null;

  if (transcript && process.env.OPENAI_API_KEY) {
    try {
      const voice = createVoiceAIProvider();
      summary = await voice.summarizeCall(transcript);
      sentiment = await voice.classifySentiment(transcript);
    } catch {
      summary = null;
      sentiment = null;
    }
  }

  const status =
    callStatus === "completed"
      ? "completed"
      : callStatus === "busy"
        ? "busy"
        : callStatus === "no-answer"
          ? "missed"
          : callStatus === "failed"
            ? "failed"
            : "completed";

  await completeCallRecord({
    organizationId,
    callId,
    status,
    durationSeconds: duration,
    summary,
    sentiment,
    costEstimateCents: Math.max(1, Math.round(duration * 0.015 * 100)),
  });

  return NextResponse.json({ ok: true });
}
