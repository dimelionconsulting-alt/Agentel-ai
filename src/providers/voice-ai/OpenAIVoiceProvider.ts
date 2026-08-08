import OpenAI from "openai";

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

export class OpenAIVoiceProvider implements VoiceAIProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(private readonly config: OpenAIVoiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenAIVoiceProvider requires an API key");
    }
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async createRealtimeSession(config: VoiceSessionConfig): Promise<VoiceSession> {
    const model = this.config.realtimeModel ?? "gpt-4o-realtime-preview";

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice: config.voice,
        modalities: ["audio", "text"],
        instructions: config.systemPrompt,
        tools: (config.tools ?? []).map((tool) => ({
          type: "function",
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI Realtime session failed: ${body}`);
    }

    const payload = (await response.json()) as {
      id: string;
      client_secret?: { value?: string };
    };

    return {
      sessionId: payload.id,
      provider: this.name,
      websocketUrl: `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
      ephemeralKey: payload.client_secret?.value,
    };
  }

  async endSession(sessionId: string): Promise<void> {
    void sessionId;
    // Realtime sessions expire automatically; explicit delete is optional.
  }

  async summarizeCall(transcript: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.config.textModel ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Summarize the phone call in 2-4 sentences. Include intent, outcome, and next steps.",
        },
        { role: "user", content: transcript },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || "No summary available.";
  }

  async extractLead(transcript: string): Promise<Record<string, unknown>> {
    const completion = await this.client.chat.completions.create({
      model: this.config.textModel ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Extract lead fields as JSON with keys: name, phone, email, company, interest, notes, qualification_score (0-100).',
        },
        { role: "user", content: transcript },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as Record<string, unknown>;
  }

  async classifySentiment(transcript: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.config.textModel ?? "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Classify sentiment as positive, neutral, or negative. Reply with one word.",
        },
        { role: "user", content: transcript },
      ],
    });

    return (
      completion.choices[0]?.message?.content?.trim().toLowerCase() || "neutral"
    );
  }
}
