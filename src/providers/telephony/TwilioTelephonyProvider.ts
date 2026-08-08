import { createHmac, timingSafeEqual } from "crypto";

import type {
  MediaStreamConfig,
  PlaceOutboundCallParams,
  PlaceOutboundCallResult,
  PurchaseNumberParams,
  PurchasedNumber,
  SendSmsParams,
  SendSmsResult,
  TelephonyProvider,
} from "@/types/providers";

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  apiKeySecret?: string;
}

/**
 * First telephony implementation. Phase 3 will wire live Twilio REST + Media Streams.
 * This class keeps all Twilio-specific concerns behind TelephonyProvider.
 */
export class TwilioTelephonyProvider implements TelephonyProvider {
  readonly name = "twilio" as const;

  constructor(private readonly config: TwilioConfig) {
    if (!config.accountSid || !config.authToken) {
      throw new Error("TwilioTelephonyProvider requires accountSid and authToken");
    }
  }

  async searchAvailableNumbers(params: PurchaseNumberParams): Promise<PurchasedNumber[]> {
    void params;
    throw new Error("Twilio number search is implemented in Phase 3");
  }

  async purchaseNumber(params: PurchaseNumberParams): Promise<PurchasedNumber> {
    void params;
    throw new Error("Twilio number purchase is implemented in Phase 3");
  }

  async releaseNumber(providerSid: string): Promise<void> {
    void providerSid;
    throw new Error("Twilio number release is implemented in Phase 3");
  }

  async configureInboundWebhook(providerSid: string, webhookUrl: string): Promise<void> {
    void providerSid;
    void webhookUrl;
    throw new Error("Twilio inbound webhook configuration is implemented in Phase 3");
  }

  async placeOutboundCall(
    params: PlaceOutboundCallParams,
  ): Promise<PlaceOutboundCallResult> {
    void params;
    throw new Error("Twilio outbound calling is implemented in Phase 3");
  }

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    void params;
    throw new Error("Twilio SMS is implemented in Phase 5/6");
  }

  buildMediaStreamInstructions(config: MediaStreamConfig): string {
    const track = config.track ?? "both_tracks";
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${config.streamUrl}" track="${track}" />
  </Connect>
</Response>`;
  }

  verifyWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    const data = Object.keys(params)
      .sort()
      .reduce((acc, key) => `${acc}${key}${params[key]}`, url);

    const expected = createHmac("sha1", this.config.authToken)
      .update(Buffer.from(data, "utf-8"))
      .digest("base64");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
