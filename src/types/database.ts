export type OrganizationRole =
  | "owner"
  | "admin"
  | "agent_manager"
  | "viewer";

export type AgentStatus = "draft" | "active" | "paused";

export type CallDirection = "inbound" | "outbound";

export type CallStatus =
  | "queued"
  | "ringing"
  | "in_progress"
  | "completed"
  | "missed"
  | "failed"
  | "busy"
  | "canceled"
  | "transferred";

export type CallOutcome =
  | "resolved"
  | "transferred"
  | "appointment_booked"
  | "lead_captured"
  | "voicemail"
  | "no_answer"
  | "failed"
  | "other";

export type PhoneNumberStatus = "available" | "assigned" | "released";

export type TelecomProvider = "twilio" | "sip" | "other";

export type KnowledgeDocumentType =
  | "text"
  | "faq"
  | "website"
  | "pdf"
  | "docx"
  | "txt";

export type KnowledgeDocumentStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed";

export type IntegrationProvider =
  | "google_calendar"
  | "outlook_calendar"
  | "hubspot"
  | "salesforce"
  | "zapier"
  | "webhook"
  | "custom_rest";

export type SubscriptionPlan =
  | "starter"
  | "professional"
  | "business"
  | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type WebhookEventType =
  | "call.started"
  | "call.answered"
  | "call.completed"
  | "call.transferred"
  | "lead.created"
  | "appointment.created";

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface OrganizationScoped {
  organization_id: string;
}

export interface Organization extends Timestamps {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  industry: string | null;
  timezone: string;
  logo_url: string | null;
  recording_enabled: boolean;
  recording_consent_required: boolean;
  data_retention_days: number;
  transcript_retention_days: number;
}

export interface UserProfile extends Timestamps {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_platform_admin: boolean;
}

export interface OrganizationMember extends Timestamps, OrganizationScoped {
  id: string;
  user_id: string;
  role: OrganizationRole;
}

export interface Agent extends Timestamps, OrganizationScoped {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  status: AgentStatus;
  voice: string;
  language: string;
  additional_languages: string[];
  greeting_message: string | null;
  system_prompt: string | null;
  business_description: string | null;
  objective: string | null;
  conversation_style: string | null;
  speaking_speed: number;
  interruption_handling: string;
  max_call_duration_seconds: number;
  silence_timeout_seconds: number;
  transfer_phone_number: string | null;
  transfer_conditions: string[];
  business_hours: Record<string, unknown> | null;
  emergency_transfer_enabled: boolean;
  sms_follow_up_enabled: boolean;
}

export interface PhoneNumber extends Timestamps, OrganizationScoped {
  id: string;
  provider: TelecomProvider;
  e164: string;
  friendly_name: string | null;
  country_code: string;
  capabilities: string[];
  status: PhoneNumberStatus;
  provider_sid: string | null;
  inbound_enabled: boolean;
  outbound_caller_id_enabled: boolean;
  forwarding_number: string | null;
  human_fallback_number: string | null;
}

export interface AgentPhoneNumber extends Timestamps, OrganizationScoped {
  id: string;
  agent_id: string;
  phone_number_id: string;
  is_primary: boolean;
}

export interface Call extends Timestamps, OrganizationScoped {
  id: string;
  agent_id: string | null;
  phone_number_id: string | null;
  direction: CallDirection;
  status: CallStatus;
  outcome: CallOutcome | null;
  from_number: string | null;
  to_number: string | null;
  caller_name: string | null;
  started_at: string | null;
  answered_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  recording_url: string | null;
  sentiment: string | null;
  detected_intent: string | null;
  summary: string | null;
  cost_estimate_cents: number;
  provider: TelecomProvider;
  provider_call_sid: string | null;
  transferred_to: string | null;
}

export interface CallTranscript extends Timestamps, OrganizationScoped {
  id: string;
  call_id: string;
  content: string;
  segments: unknown[];
}

export interface CallEvent extends Timestamps, OrganizationScoped {
  id: string;
  call_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface CallAction extends Timestamps, OrganizationScoped {
  id: string;
  call_id: string;
  action_type: string;
  tool_name: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  success: boolean;
}

export interface Contact extends Timestamps, OrganizationScoped {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  metadata: Record<string, unknown>;
}

export interface Lead extends Timestamps, OrganizationScoped {
  id: string;
  contact_id: string | null;
  call_id: string | null;
  agent_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  interest: string | null;
  notes: string | null;
  qualification_score: number | null;
  status: string;
}

export interface Appointment extends Timestamps, OrganizationScoped {
  id: string;
  contact_id: string | null;
  call_id: string | null;
  agent_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: string;
  location: string | null;
  notes: string | null;
  external_calendar_event_id: string | null;
}

export interface KnowledgeBase extends Timestamps, OrganizationScoped {
  id: string;
  agent_id: string | null;
  name: string;
  description: string | null;
}

export interface KnowledgeDocument extends Timestamps, OrganizationScoped {
  id: string;
  knowledge_base_id: string;
  title: string;
  document_type: KnowledgeDocumentType;
  source_url: string | null;
  storage_path: string | null;
  status: KnowledgeDocumentStatus;
  raw_content: string | null;
  error_message: string | null;
}

export interface KnowledgeChunk extends Timestamps, OrganizationScoped {
  id: string;
  document_id: string;
  knowledge_base_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
}

export interface Integration extends Timestamps, OrganizationScoped {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: string;
  config: Record<string, unknown>;
}

export interface IntegrationCredential extends Timestamps, OrganizationScoped {
  id: string;
  integration_id: string;
  encrypted_payload: string;
  expires_at: string | null;
}

export interface AgentTool extends Timestamps, OrganizationScoped {
  id: string;
  agent_id: string;
  tool_name: string;
  display_name: string;
  description: string | null;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface UsageRecord extends Timestamps, OrganizationScoped {
  id: string;
  metric: string;
  quantity: number;
  unit: string;
  period_start: string;
  period_end: string;
  metadata: Record<string, unknown>;
}

export interface Subscription extends Timestamps, OrganizationScoped {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  included_minutes: number;
  extra_minute_price_cents: number;
  max_agents: number;
  max_phone_numbers: number;
  knowledge_storage_mb: number;
}

export interface ApiKey extends Timestamps, OrganizationScoped {
  id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  last_used_at: string | null;
  revoked_at: string | null;
  scopes: string[];
}

export interface WebhookEndpoint extends Timestamps, OrganizationScoped {
  id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  enabled: boolean;
}

export interface AuditLog extends Timestamps, OrganizationScoped {
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
}

export interface MembershipWithOrganization extends OrganizationMember {
  organization: Organization;
  user?: UserProfile;
}
