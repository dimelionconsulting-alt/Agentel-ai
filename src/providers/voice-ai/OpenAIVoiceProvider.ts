import type {
  VoiceAIProvider,
  VoiceSession,
  VoiceSessionConfig,
} from "@/types/providers";

export interface OpenAIVoiceConfig {
  apiKey: string;
  realtimeModel?: string;
  textModel?: string;
}

/**
 * First Voice AI implementation using OpenAI Realtime + text models.
 * Live websocket bridging lands in Phase 3.
 */
export class OpenAIVoiceProvider implements VoiceAIProvider {
  readonly name = "openai";

  constructor(private readonly config: OpenAIVoiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenAIVoiceProvider requires an API key");
    }
  }

  async createRealtimeSession(config: VoiceSessionConfig): Promise<VoiceSession> {
    void config;
    throw new Error("OpenAI Realtime session creation is implemented in Phase 3");
  }

  async endSession(sessionId: string): Promise<void> {
    void sessionId;
    throw new Error("OpenAI Realtime session teardown is implemented in Phase 3");
  }

  async summarizeCall(transcript: string): Promise<string> {
    void transcript;
    throw new Error("Call summarization is implemented in Phase 4");
  }

  async extractLead(transcript: string): Promise<Record<string, unknown>> {
    void transcript;
    throw new Error("Lead extraction is implemented in Phase 6");
  }

  async classifySentiment(transcript: string): Promise<string> {
    void transcript;
    throw new Error("Sentiment classification is implemented in Phase 4");
  }
}
