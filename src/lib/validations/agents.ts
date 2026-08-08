import { z } from "zod";

export const agentStatusSchema = z.enum(["draft", "active", "paused"]);

export const businessHoursSchema = z
  .object({
    timezone: z.string().default("UTC"),
    monday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    friday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }).optional(),
  })
  .partial()
  .nullable()
  .optional();

export const agentFormSchema = z.object({
  name: z.string().min(2, "Agent name is required").max(120),
  description: z.string().max(500).optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal("")),
  status: agentStatusSchema.default("draft"),
  voice: z.string().min(1).default("alloy"),
  language: z.string().min(2).default("en"),
  additional_languages: z.array(z.string()).default([]),
  greeting_message: z.string().max(1000).optional().nullable(),
  system_prompt: z.string().max(8000).optional().nullable(),
  business_description: z.string().max(4000).optional().nullable(),
  objective: z.string().max(1000).optional().nullable(),
  conversation_style: z.string().max(500).optional().nullable(),
  speaking_speed: z.coerce.number().min(0.5).max(2).default(1),
  interruption_handling: z
    .enum(["strict", "balanced", "permissive"])
    .default("balanced"),
  max_call_duration_seconds: z.coerce.number().int().min(60).max(7200).default(1800),
  silence_timeout_seconds: z.coerce.number().int().min(3).max(60).default(10),
  transfer_phone_number: z.string().max(32).optional().nullable(),
  transfer_conditions: z.array(z.string()).default([]),
  business_hours: businessHoursSchema,
  emergency_transfer_enabled: z.boolean().default(false),
  sms_follow_up_enabled: z.boolean().default(false),
  enabled_tools: z.array(z.string()).default([]),
  phone_number_id: z.string().uuid().optional().nullable(),
  knowledge_notes: z.string().max(8000).optional().nullable(),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

export const defaultAgentFormValues: AgentFormValues = {
  name: "",
  description: "",
  avatar_url: "",
  status: "draft",
  voice: "alloy",
  language: "en",
  additional_languages: [],
  greeting_message: "Hi, thanks for calling. How can I help you today?",
  system_prompt:
    "You are a professional AI phone agent. Be concise, helpful, and confirm important details before taking action.",
  business_description: "",
  objective: "Resolve the caller’s request or capture a qualified lead.",
  conversation_style: "Warm, clear, and professional",
  speaking_speed: 1,
  interruption_handling: "balanced",
  max_call_duration_seconds: 1800,
  silence_timeout_seconds: 10,
  transfer_phone_number: "",
  transfer_conditions: ["caller_requests_human", "unresolved_question"],
  business_hours: {
    timezone: "UTC",
    monday: { start: "09:00", end: "17:00", enabled: true },
    tuesday: { start: "09:00", end: "17:00", enabled: true },
    wednesday: { start: "09:00", end: "17:00", enabled: true },
    thursday: { start: "09:00", end: "17:00", enabled: true },
    friday: { start: "09:00", end: "17:00", enabled: true },
    saturday: { start: "09:00", end: "17:00", enabled: false },
    sunday: { start: "09:00", end: "17:00", enabled: false },
  },
  emergency_transfer_enabled: false,
  sms_follow_up_enabled: false,
  enabled_tools: ["create_lead", "book_appointment", "transfer_call"],
  phone_number_id: null,
  knowledge_notes: "",
};

export const VOICE_OPTIONS = [
  { id: "alloy", label: "Alloy" },
  { id: "ash", label: "Ash" },
  { id: "ballad", label: "Ballad" },
  { id: "coral", label: "Coral" },
  { id: "echo", label: "Echo" },
  { id: "sage", label: "Sage" },
  { id: "shimmer", label: "Shimmer" },
  { id: "verse", label: "Verse" },
] as const;

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "nl", label: "Dutch" },
  { id: "pt", label: "Portuguese" },
  { id: "it", label: "Italian" },
] as const;

export const TRANSFER_CONDITION_OPTIONS = [
  { id: "caller_requests_human", label: "Caller explicitly requests a human" },
  { id: "unresolved_question", label: "AI cannot resolve the question" },
  { id: "sales_opportunity", label: "Sales opportunity" },
  { id: "complaint", label: "Complaint" },
  { id: "custom", label: "Custom condition" },
] as const;
