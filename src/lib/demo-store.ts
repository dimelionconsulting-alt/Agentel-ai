import type {
  Agent,
  AgentTool,
  Call,
  CallTranscript,
  KnowledgeBase,
  KnowledgeDocument,
  Lead,
  PhoneNumber,
} from "@/types";

type DemoState = {
  agents: Agent[];
  agentTools: AgentTool[];
  phoneNumbers: PhoneNumber[];
  calls: Call[];
  transcripts: CallTranscript[];
  leads: Lead[];
  knowledgeBases: KnowledgeBase[];
  knowledgeDocuments: KnowledgeDocument[];
};

declare global {
  var __agentelDemoStore: DemoState | undefined;
}

function now() {
  return new Date().toISOString();
}

function seed(): DemoState {
  const organizationId = "00000000-0000-4000-8000-000000000001";
  const agentId = "00000000-0000-4000-8000-000000000101";
  const phoneId = "00000000-0000-4000-8000-000000000201";
  const callId = "00000000-0000-4000-8000-000000000301";
  const ts = now();

  return {
    agents: [
      {
        id: agentId,
        organization_id: organizationId,
        name: "Front Desk",
        description: "Answers inbound calls, books appointments, and captures leads.",
        avatar_url: null,
        status: "active",
        voice: "alloy",
        language: "en",
        additional_languages: ["es"],
        greeting_message: "Thanks for calling. How can I help you today?",
        system_prompt:
          "You are the front desk agent. Be warm and efficient. Confirm details before booking.",
        business_description: "A modern multi-location services company.",
        objective: "Resolve requests or book appointments.",
        conversation_style: "Warm and professional",
        speaking_speed: 1,
        interruption_handling: "balanced",
        max_call_duration_seconds: 1800,
        silence_timeout_seconds: 10,
        transfer_phone_number: "+15550109999",
        transfer_conditions: ["caller_requests_human", "complaint"],
        business_hours: { timezone: "UTC" },
        emergency_transfer_enabled: true,
        sms_follow_up_enabled: true,
        created_at: ts,
        updated_at: ts,
      },
    ],
    agentTools: [
      {
        id: "00000000-0000-4000-8000-000000000401",
        organization_id: organizationId,
        agent_id: agentId,
        tool_name: "book_appointment",
        display_name: "Book appointment",
        description: "Create a confirmed appointment",
        enabled: true,
        config: {},
        created_at: ts,
        updated_at: ts,
      },
      {
        id: "00000000-0000-4000-8000-000000000402",
        organization_id: organizationId,
        agent_id: agentId,
        tool_name: "create_lead",
        display_name: "Create lead",
        description: "Capture a qualified lead",
        enabled: true,
        config: {},
        created_at: ts,
        updated_at: ts,
      },
      {
        id: "00000000-0000-4000-8000-000000000403",
        organization_id: organizationId,
        agent_id: agentId,
        tool_name: "transfer_call",
        display_name: "Transfer call",
        description: "Transfer to a human",
        enabled: true,
        config: {},
        created_at: ts,
        updated_at: ts,
      },
    ],
    phoneNumbers: [
      {
        id: phoneId,
        organization_id: organizationId,
        provider: "twilio",
        e164: "+15550101010",
        friendly_name: "Main line",
        country_code: "US",
        capabilities: ["voice", "sms"],
        status: "assigned",
        provider_sid: "PNdemo0001",
        inbound_enabled: true,
        outbound_caller_id_enabled: true,
        forwarding_number: null,
        human_fallback_number: "+15550109999",
        created_at: ts,
        updated_at: ts,
      },
    ],
    calls: [
      {
        id: callId,
        organization_id: organizationId,
        agent_id: agentId,
        phone_number_id: phoneId,
        direction: "inbound",
        status: "completed",
        outcome: "appointment_booked",
        from_number: "+14155550132",
        to_number: "+15550101010",
        caller_name: "Alex Rivera",
        started_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        answered_at: new Date(Date.now() - 1000 * 60 * 40 + 4000).toISOString(),
        ended_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        duration_seconds: 312,
        recording_url: null,
        sentiment: "positive",
        detected_intent: "book_appointment",
        summary:
          "Caller booked a consultation for Tuesday at 10:00 AM and requested an SMS confirmation.",
        cost_estimate_cents: 28,
        provider: "twilio",
        provider_call_sid: "CAdemo0001",
        transferred_to: null,
        created_at: ts,
        updated_at: ts,
      },
    ],
    transcripts: [
      {
        id: "00000000-0000-4000-8000-000000000501",
        organization_id: organizationId,
        call_id: callId,
        content:
          "Agent: Thanks for calling. How can I help you today?\nCaller: I'd like to book an appointment.\nAgent: Absolutely — what day works best?\nCaller: Tuesday morning.\nAgent: I can do Tuesday at 10:00 AM. Shall I book that?\nCaller: Yes please.\nAgent: You're booked. I'll send an SMS confirmation.",
        segments: [],
        created_at: ts,
        updated_at: ts,
      },
    ],
    leads: [
      {
        id: "00000000-0000-4000-8000-000000000601",
        organization_id: organizationId,
        contact_id: null,
        call_id: callId,
        agent_id: agentId,
        name: "Alex Rivera",
        phone: "+14155550132",
        email: "alex@example.com",
        company: "Rivera Studio",
        interest: "Consultation",
        notes: "Prefers morning appointments",
        qualification_score: 82,
        status: "new",
        created_at: ts,
        updated_at: ts,
      },
    ],
    knowledgeBases: [
      {
        id: "00000000-0000-4000-8000-000000000701",
        organization_id: organizationId,
        agent_id: agentId,
        name: "Front Desk Knowledge",
        description: "Services, hours, and FAQ",
        created_at: ts,
        updated_at: ts,
      },
    ],
    knowledgeDocuments: [
      {
        id: "00000000-0000-4000-8000-000000000801",
        organization_id: organizationId,
        knowledge_base_id: "00000000-0000-4000-8000-000000000701",
        title: "Business hours FAQ",
        document_type: "faq",
        source_url: null,
        storage_path: null,
        status: "ready",
        raw_content: "We are open Monday–Friday 9:00–17:00 UTC.",
        error_message: null,
        created_at: ts,
        updated_at: ts,
      },
    ],
  };
}

export function getDemoStore(): DemoState {
  if (!globalThis.__agentelDemoStore) {
    globalThis.__agentelDemoStore = seed();
  }
  return globalThis.__agentelDemoStore;
}

export function resetDemoStore() {
  globalThis.__agentelDemoStore = seed();
}
