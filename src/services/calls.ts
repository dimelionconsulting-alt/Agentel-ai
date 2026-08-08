import { randomUUID } from "crypto";

import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type {
  Call,
  CallAction,
  CallDirection,
  CallEvent,
  CallOutcome,
  CallStatus,
  CallTranscript,
} from "@/types";

export type CallDetail = Call & {
  transcript: CallTranscript | null;
  events: CallEvent[];
  actions: CallAction[];
  agentName?: string | null;
};

export async function listCalls(organizationId: string): Promise<Call[]> {
  if (isDemoMode()) {
    return getDemoStore()
      .calls.filter((call) => call.organization_id === organizationId)
      .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("organization_id", organizationId)
    .order("started_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Call[];
}

export async function getCallDetail(
  organizationId: string,
  callId: string,
): Promise<CallDetail | null> {
  if (isDemoMode()) {
    const store = getDemoStore();
    const call = store.calls.find(
      (item) => item.id === callId && item.organization_id === organizationId,
    );
    if (!call) return null;
    return {
      ...call,
      transcript: store.transcripts.find((item) => item.call_id === callId) ?? null,
      events: [],
      actions: [],
      agentName:
        store.agents.find((agent) => agent.id === call.agent_id)?.name ?? null,
    };
  }

  const supabase = await createClient();
  const { data: call } = await supabase
    .from("calls")
    .select("*, agent:agents(name)")
    .eq("organization_id", organizationId)
    .eq("id", callId)
    .maybeSingle();

  if (!call) return null;

  const [{ data: transcript }, { data: events }, { data: actions }] = await Promise.all([
    supabase.from("call_transcripts").select("*").eq("call_id", callId).maybeSingle(),
    supabase
      .from("call_events")
      .select("*")
      .eq("call_id", callId)
      .order("occurred_at", { ascending: true }),
    supabase
      .from("call_actions")
      .select("*")
      .eq("call_id", callId)
      .order("created_at", { ascending: true }),
  ]);

  const agentRelation = call.agent as { name?: string } | { name?: string }[] | null;
  const agentName = Array.isArray(agentRelation)
    ? agentRelation[0]?.name
    : agentRelation?.name;

  return {
    ...(call as Call),
    transcript: (transcript as CallTranscript) ?? null,
    events: (events as CallEvent[]) ?? [],
    actions: (actions as CallAction[]) ?? [],
    agentName: agentName ?? null,
  };
}

export async function createCallRecord(input: {
  organizationId: string;
  agentId?: string | null;
  phoneNumberId?: string | null;
  direction: CallDirection;
  fromNumber?: string | null;
  toNumber?: string | null;
  callerName?: string | null;
  providerCallSid?: string | null;
  status?: CallStatus;
}): Promise<Call> {
  const timestamp = new Date().toISOString();
  const call: Call = {
    id: randomUUID(),
    organization_id: input.organizationId,
    agent_id: input.agentId ?? null,
    phone_number_id: input.phoneNumberId ?? null,
    direction: input.direction,
    status: input.status ?? "queued",
    outcome: null,
    from_number: input.fromNumber ?? null,
    to_number: input.toNumber ?? null,
    caller_name: input.callerName ?? null,
    started_at: timestamp,
    answered_at: null,
    ended_at: null,
    duration_seconds: 0,
    recording_url: null,
    sentiment: null,
    detected_intent: null,
    summary: null,
    cost_estimate_cents: 0,
    provider: "twilio",
    provider_call_sid: input.providerCallSid ?? null,
    transferred_to: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (isDemoMode()) {
    getDemoStore().calls.unshift(call);
    return call;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("calls").insert(call).select("*").single();
  if (error || !data) throw new Error(error?.message ?? "Unable to create call");
  return data as Call;
}

export async function completeCallRecord(input: {
  organizationId: string;
  callId: string;
  status: CallStatus;
  outcome?: CallOutcome | null;
  durationSeconds?: number;
  summary?: string | null;
  sentiment?: string | null;
  detectedIntent?: string | null;
  transcript?: string;
  transferredTo?: string | null;
  costEstimateCents?: number;
}): Promise<Call> {
  const endedAt = new Date().toISOString();

  if (isDemoMode()) {
    const store = getDemoStore();
    const call = store.calls.find((item) => item.id === input.callId);
    if (!call) throw new Error("Call not found");
    call.status = input.status;
    call.outcome = input.outcome ?? call.outcome;
    call.ended_at = endedAt;
    call.duration_seconds = input.durationSeconds ?? call.duration_seconds;
    call.summary = input.summary ?? call.summary;
    call.sentiment = input.sentiment ?? call.sentiment;
    call.detected_intent = input.detectedIntent ?? call.detected_intent;
    call.transferred_to = input.transferredTo ?? call.transferred_to;
    call.cost_estimate_cents = input.costEstimateCents ?? call.cost_estimate_cents;
    call.updated_at = endedAt;

    if (input.transcript) {
      const existing = store.transcripts.find((item) => item.call_id === call.id);
      if (existing) {
        existing.content = input.transcript;
        existing.updated_at = endedAt;
      } else {
        store.transcripts.push({
          id: randomUUID(),
          organization_id: input.organizationId,
          call_id: call.id,
          content: input.transcript,
          segments: [],
          created_at: endedAt,
          updated_at: endedAt,
        });
      }
    }

    return call;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .update({
      status: input.status,
      outcome: input.outcome,
      ended_at: endedAt,
      duration_seconds: input.durationSeconds,
      summary: input.summary,
      sentiment: input.sentiment,
      detected_intent: input.detectedIntent,
      transferred_to: input.transferredTo,
      cost_estimate_cents: input.costEstimateCents,
    })
    .eq("id", input.callId)
    .eq("organization_id", input.organizationId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to complete call");

  if (input.transcript) {
    await supabase.from("call_transcripts").upsert({
      organization_id: input.organizationId,
      call_id: input.callId,
      content: input.transcript,
      segments: [],
    });
  }

  return data as Call;
}
