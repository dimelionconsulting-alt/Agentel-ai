import { NextResponse } from "next/server";

import { requireAuthContext } from "@/lib/auth/session";
import { createVoiceAIProvider } from "@/providers/voice-ai";

export async function POST(request: Request) {
  await requireAuthContext();

  const body = (await request.json()) as {
    agentName?: string;
    systemPrompt?: string;
    voice?: string;
    language?: string;
    greeting?: string;
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      mode: "simulated",
      reason: "OPENAI_API_KEY is not configured",
    });
  }

  try {
    const provider = createVoiceAIProvider();
    const session = await provider.createRealtimeSession({
      agentId: "browser-test",
      organizationId: "browser-test",
      systemPrompt: [
        body.systemPrompt,
        body.greeting ? `Start by saying: ${body.greeting}` : null,
        `You are ${body.agentName || "an AI phone agent"}.`,
      ]
        .filter(Boolean)
        .join("\n"),
      voice: body.voice || "alloy",
      language: body.language || "en",
    });

    return NextResponse.json({
      mode: "realtime",
      sessionId: session.sessionId,
      clientSecret: session.ephemeralKey,
      websocketUrl: session.websocketUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        mode: "simulated",
        reason: error instanceof Error ? error.message : "Realtime unavailable",
      },
      { status: 200 },
    );
  }
}
