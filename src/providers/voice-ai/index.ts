import { OpenAIVoiceProvider } from "./OpenAIVoiceProvider";
import type { VoiceAIProvider } from "./VoiceAIProvider";

export * from "./OpenAIVoiceProvider";
export * from "./VoiceAIProvider";

export function createVoiceAIProvider(): VoiceAIProvider {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAIVoiceProvider({
    apiKey,
    realtimeModel: process.env.OPENAI_REALTIME_MODEL,
    textModel: process.env.OPENAI_TEXT_MODEL,
  });
}
