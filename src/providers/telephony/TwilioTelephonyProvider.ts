import twilio from "twilio";

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

export function buildTwilioMediaStreamInstructions(config: MediaStreamConfig): string {
  const track = config.track ?? "inbound_track";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${config.streamUrl}" track="${track}" />
  </Connect>
</Response>`;
}

export class TwilioTelephonyProvider implements TelephonyProvider {
  readonly name = "twilio" as const;
  private client: ReturnType<typeof twilio>;

  constructor(private readonly config: TwilioConfig) {
    if (!config.accountSid || !config.authToken) {
      throw new Error("TwilioTelephonyProvider requires accountSid and authToken");
    }
    this.client = twilio(config.accountSid, config.authToken);
  }

  async searchAvailableNumbers(params: PurchaseNumberParams): Promise<PurchasedNumber[]> {
    const numbers = await this.client
      .availablePhoneNumbers(params.country)
      .local.list({
        areaCode: params.areaCode ? Number(params.areaCode) : undefined,
        contains: params.contains,
        voiceEnabled: true,
        limit: 10,
      });

    return numbers.map((item) => ({
      provider: "twilio" as const,
      e164: item.phoneNumber,
      providerSid: item.phoneNumber,
      friendlyName: item.friendlyName,
      capabilities: [
        item.capabilities.voice ? "voice" : "",
        item.capabilities.sms ? "sms" : "",
      ].filter(Boolean),
    }));
  }

  async purchaseNumber(params: PurchaseNumberParams): Promise<PurchasedNumber> {
    const available = await this.searchAvailableNumbers(params);
    const selected = available[0];
    if (!selected) {
      throw new Error("No phone numbers available for the requested criteria");
    }

    const purchased = await this.client.incomingPhoneNumbers.create({
      phoneNumber: selected.e164,
    });

    return {
      provider: "twilio",
      e164: purchased.phoneNumber,
      providerSid: purchased.sid,
      friendlyName: purchased.friendlyName,
      capabilities: ["voice", "sms"],
    };
  }

  async releaseNumber(providerSid: string): Promise<void> {
    await this.client.incomingPhoneNumbers(providerSid).remove();
  }

  async configureInboundWebhook(providerSid: string, webhookUrl: string): Promise<void> {
    await this.client.incomingPhoneNumbers(providerSid).update({
      voiceUrl: webhookUrl,
      voiceMethod: "POST",
    });
  }

  async placeOutboundCall(
    params: PlaceOutboundCallParams,
  ): Promise<PlaceOutboundCallResult> {
    const call = await this.client.calls.create({
      from: params.callerId || params.from,
      to: params.to,
      url: params.webhookUrl,
      statusCallback: params.statusCallbackUrl,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    });

    return {
      providerCallSid: call.sid,
      status: call.status,
    };
  }

  async sendSms(params: SendSmsParams): Promise<SendSmsResult> {
    const message = await this.client.messages.create({
      from: params.from,
      to: params.to,
      body: params.body,
    });

    return {
      providerMessageSid: message.sid,
      status: message.status,
    };
  }

  buildMediaStreamInstructions(config: MediaStreamConfig): string {
    return buildTwilioMediaStreamInstructions(config);
  }

  verifyWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    return twilio.validateRequest(this.config.authToken, signature, url, params);
  }
}
