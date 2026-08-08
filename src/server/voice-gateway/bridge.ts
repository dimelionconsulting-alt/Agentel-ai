import WebSocket from "ws";

import type { Agent } from "@/types";

export type BridgeLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

/**
 * Bridges Twilio Media Streams <-> OpenAI Realtime audio.
 * Twilio sends mulaw 8k PCM frames; OpenAI Realtime expects PCM16/G.711 depending on session config.
 * This bridge keeps provider-specific framing isolated from the rest of the app.
 */
export class TwilioOpenAIRealtimeBridge {
  private openaiSocket: WebSocket | null = null;
  private closed = false;
  private transcript: string[] = [];

  constructor(
    private readonly twilioSocket: WebSocket,
    private readonly agent: Agent,
    private readonly openaiApiKey: string,
    private readonly logger: BridgeLogger = console,
  ) {}

  async start() {
    const model = process.env.OPENAI_REALTIME_MODEL ?? "gpt-4o-realtime-preview";
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;

    this.openaiSocket = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    await new Promise<void>((resolve, reject) => {
      this.openaiSocket?.once("open", () => resolve());
      this.openaiSocket?.once("error", (error) => reject(error));
    });

    this.openaiSocket.send(
      JSON.stringify({
        type: "session.update",
        session: {
          voice: this.agent.voice,
          instructions: this.buildInstructions(),
          turn_detection: { type: "server_vad" },
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
          modalities: ["audio", "text"],
        },
      }),
    );

    if (this.agent.greeting_message) {
      this.openaiSocket.send(
        JSON.stringify({
          type: "response.create",
          response: {
            instructions: `Greet the caller with: ${this.agent.greeting_message}`,
          },
        }),
      );
    }

    this.twilioSocket.on("message", (raw) => this.onTwilioMessage(raw.toString()));
    this.openaiSocket.on("message", (raw) => this.onOpenAIMessage(raw.toString()));
    this.twilioSocket.on("close", () => this.close());
    this.openaiSocket.on("close", () => this.close());
  }

  getTranscript() {
    return this.transcript.join("\n");
  }

  private buildInstructions() {
    return [
      this.agent.system_prompt,
      this.agent.business_description
        ? `Business context: ${this.agent.business_description}`
        : null,
      this.agent.objective ? `Objective: ${this.agent.objective}` : null,
      this.agent.conversation_style
        ? `Conversation style: ${this.agent.conversation_style}`
        : null,
      "Confirm important details with the caller before booking appointments or creating leads.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private onTwilioMessage(raw: string) {
    if (!this.openaiSocket || this.closed) return;

    try {
      const message = JSON.parse(raw) as {
        event: string;
        media?: { payload?: string };
        start?: { streamSid?: string };
      };

      if (message.event === "media" && message.media?.payload) {
        this.openaiSocket.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: message.media.payload,
          }),
        );
      }

      if (message.event === "start") {
        this.logger.info("Twilio stream started", {
          streamSid: message.start?.streamSid,
          agentId: this.agent.id,
        });
      }

      if (message.event === "stop") {
        this.close();
      }
    } catch (error) {
      this.logger.error("Failed to parse Twilio media message", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  private onOpenAIMessage(raw: string) {
    if (this.closed) return;

    try {
      const message = JSON.parse(raw) as {
        type: string;
        delta?: string;
        transcript?: string;
        streamSid?: string;
      };

      if (message.type === "response.audio.delta" && message.delta) {
        this.twilioSocket.send(
          JSON.stringify({
            event: "media",
            streamSid: message.streamSid,
            media: { payload: message.delta },
          }),
        );
      }

      if (
        message.type === "response.audio_transcript.done" ||
        message.type === "conversation.item.input_audio_transcription.completed"
      ) {
        if (message.transcript) {
          this.transcript.push(message.transcript);
        }
      }
    } catch (error) {
      this.logger.error("Failed to parse OpenAI realtime message", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.openaiSocket?.close();
    } catch {
      // ignore
    }
    try {
      this.twilioSocket.close();
    } catch {
      // ignore
    }
  }
}
