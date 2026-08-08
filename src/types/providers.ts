import type { TelecomProvider } from "./database";

export interface PurchaseNumberParams {
  country: string;
  areaCode?: string;
  contains?: string;
}

export interface PurchasedNumber {
  provider: TelecomProvider;
  e164: string;
  providerSid: string;
  friendlyName?: string;
  capabilities: string[];
}

export interface PlaceOutboundCallParams {
  from: string;
  to: string;
  webhookUrl: string;
  statusCallbackUrl?: string;
  callerId?: string;
}

export interface PlaceOutboundCallResult {
  providerCallSid: string;
  status: string;
}

export interface SendSmsParams {
  from: string;
  to: string;
  body: string;
}

export interface SendSmsResult {
  providerMessageSid: string;
  status: string;
}

export interface MediaStreamConfig {
  streamUrl: string;
  track?: "inbound_track" | "outbound_track" | "both_tracks";
}

export interface TelephonyWebhookContext {
  callSid: string;
  from: string;
  to: string;
  direction: "inbound" | "outbound";
  raw: Record<string, string>;
}

/**
 * TelephonyProvider isolates Twilio (and future SIP providers)
 * from the rest of the application.
 */
export interface TelephonyProvider {
  readonly name: TelecomProvider;
  searchAvailableNumbers(params: PurchaseNumberParams): Promise<PurchasedNumber[]>;
  purchaseNumber(params: PurchaseNumberParams): Promise<PurchasedNumber>;
  releaseNumber(providerSid: string): Promise<void>;
  configureInboundWebhook(providerSid: string, webhookUrl: string): Promise<void>;
  placeOutboundCall(params: PlaceOutboundCallParams): Promise<PlaceOutboundCallResult>;
  sendSms(params: SendSmsParams): Promise<SendSmsResult>;
  buildMediaStreamInstructions(config: MediaStreamConfig): string;
  verifyWebhookSignature(signature: string, url: string, params: Record<string, string>): boolean;
}

export interface VoiceSessionConfig {
  agentId: string;
  organizationId: string;
  systemPrompt: string;
  voice: string;
  language: string;
  speakingSpeed?: number;
  tools?: VoiceToolDefinition[];
}

export interface VoiceToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface VoiceSession {
  sessionId: string;
  provider: string;
  websocketUrl?: string;
  ephemeralKey?: string;
}

export interface VoiceTranscriptSegment {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  startedAt?: string;
  endedAt?: string;
}

/**
 * VoiceAIProvider isolates OpenAI Realtime (and future voice models).
 */
export interface VoiceAIProvider {
  readonly name: string;
  createRealtimeSession(config: VoiceSessionConfig): Promise<VoiceSession>;
  endSession(sessionId: string): Promise<void>;
  summarizeCall(transcript: string): Promise<string>;
  extractLead(transcript: string): Promise<Record<string, unknown>>;
  classifySentiment(transcript: string): Promise<string>;
}

export interface CheckoutSessionParams {
  organizationId: string;
  plan: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  stripeCustomerId?: string;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface CustomerPortalParams {
  stripeCustomerId: string;
  returnUrl: string;
}

export interface CustomerPortalResult {
  url: string;
}

export interface UsageReportParams {
  organizationId: string;
  metric: string;
  quantity: number;
  timestamp?: string;
}

/**
 * PaymentProvider isolates Stripe subscription + usage billing.
 */
export interface PaymentProvider {
  readonly name: string;
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  createCustomerPortalSession(params: CustomerPortalParams): Promise<CustomerPortalResult>;
  reportUsage(params: UsageReportParams): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
