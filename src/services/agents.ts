import { randomUUID } from "crypto";

import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { AgentFormValues } from "@/lib/validations/agents";
import { systemTools } from "@/services/tools";
import type { Agent, AgentTool, PhoneNumber } from "@/types";

export type AgentWithRelations = Agent & {
  tools: AgentTool[];
  phoneNumbers: PhoneNumber[];
};

function toAgentRow(
  organizationId: string,
  values: AgentFormValues,
  existing?: Agent,
): Omit<Agent, "id" | "created_at" | "updated_at"> & {
  id?: string;
} {
  return {
    id: existing?.id,
    organization_id: organizationId,
    name: values.name,
    description: values.description || null,
    avatar_url: values.avatar_url || null,
    status: values.status,
    voice: values.voice,
    language: values.language,
    additional_languages: values.additional_languages,
    greeting_message: values.greeting_message || null,
    system_prompt: values.system_prompt || null,
    business_description: values.business_description || null,
    objective: values.objective || null,
    conversation_style: values.conversation_style || null,
    speaking_speed: values.speaking_speed,
    interruption_handling: values.interruption_handling,
    max_call_duration_seconds: values.max_call_duration_seconds,
    silence_timeout_seconds: values.silence_timeout_seconds,
    transfer_phone_number: values.transfer_phone_number || null,
    transfer_conditions: values.transfer_conditions,
    business_hours: values.business_hours ?? null,
    emergency_transfer_enabled: values.emergency_transfer_enabled,
    sms_follow_up_enabled: values.sms_follow_up_enabled,
  };
}

async function attachRelations(
  organizationId: string,
  agents: Agent[],
): Promise<AgentWithRelations[]> {
  if (isDemoMode()) {
    const store = getDemoStore();
    return agents.map((agent, index) => ({
      ...agent,
      tools: store.agentTools.filter((tool) => tool.agent_id === agent.id),
      // Demo seed assigns the first available/assigned number to the first agent.
      phoneNumbers:
        index === 0
          ? store.phoneNumbers.filter(
              (phone) =>
                phone.organization_id === organizationId &&
                (phone.status === "assigned" || phone.status === "available"),
            ).slice(0, 1)
          : [],
    }));
  }

  const supabase = await createClient();
  const agentIds = agents.map((agent) => agent.id);

  const [{ data: tools }, { data: links }, { data: phones }] = await Promise.all([
    supabase
      .from("agent_tools")
      .select("*")
      .eq("organization_id", organizationId)
      .in("agent_id", agentIds.length ? agentIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("agent_phone_numbers")
      .select("*")
      .eq("organization_id", organizationId)
      .in("agent_id", agentIds.length ? agentIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("phone_numbers").select("*").eq("organization_id", organizationId),
  ]);

  return agents.map((agent) => {
    const linkedIds = new Set(
      (links ?? [])
        .filter((link) => link.agent_id === agent.id)
        .map((link) => link.phone_number_id),
    );

    return {
      ...agent,
      tools: (tools ?? []).filter((tool) => tool.agent_id === agent.id) as AgentTool[],
      phoneNumbers: ((phones ?? []) as PhoneNumber[]).filter((phone) =>
        linkedIds.has(phone.id),
      ),
    };
  });
}

export async function listAgents(organizationId: string): Promise<AgentWithRelations[]> {
  if (isDemoMode()) {
    const agents = getDemoStore().agents.filter(
      (agent) => agent.organization_id === organizationId,
    );
    return attachRelations(organizationId, agents);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachRelations(organizationId, (data ?? []) as Agent[]);
}

export async function getAgent(
  organizationId: string,
  agentId: string,
): Promise<AgentWithRelations | null> {
  const agents = await listAgents(organizationId);
  return agents.find((agent) => agent.id === agentId) ?? null;
}

export async function getAgentByPhoneNumber(
  e164: string,
): Promise<AgentWithRelations | null> {
  if (isDemoMode()) {
    const store = getDemoStore();
    const phone = store.phoneNumbers.find((item) => item.e164 === e164);
    if (!phone) return null;
    const linkAgent = store.agents.find(
      (agent) =>
        agent.organization_id === phone.organization_id && agent.status === "active",
    );
    if (!linkAgent) return null;
    return getAgent(linkAgent.organization_id, linkAgent.id);
  }

  const supabase = await createClient();
  const { data: phone } = await supabase
    .from("phone_numbers")
    .select("id, organization_id")
    .eq("e164", e164)
    .maybeSingle();

  if (!phone) return null;

  const { data: link } = await supabase
    .from("agent_phone_numbers")
    .select("agent_id, organization_id")
    .eq("phone_number_id", phone.id)
    .maybeSingle();

  if (!link) return null;
  return getAgent(link.organization_id, link.agent_id);
}

async function syncAgentTools(
  organizationId: string,
  agentId: string,
  enabledTools: string[],
) {
  const timestamp = new Date().toISOString();

  if (isDemoMode()) {
    const store = getDemoStore();
    store.agentTools = store.agentTools.filter((tool) => tool.agent_id !== agentId);
    for (const toolName of enabledTools) {
      const meta = systemTools.find((tool) => tool.name === toolName);
      store.agentTools.push({
        id: randomUUID(),
        organization_id: organizationId,
        agent_id: agentId,
        tool_name: toolName,
        display_name: meta?.displayName ?? toolName,
        description: meta?.description ?? null,
        enabled: true,
        config: {},
        created_at: timestamp,
        updated_at: timestamp,
      });
    }
    return;
  }

  const supabase = await createClient();
  await supabase.from("agent_tools").delete().eq("agent_id", agentId);

  if (!enabledTools.length) return;

  await supabase.from("agent_tools").insert(
    enabledTools.map((toolName) => {
      const meta = systemTools.find((tool) => tool.name === toolName);
      return {
        organization_id: organizationId,
        agent_id: agentId,
        tool_name: toolName,
        display_name: meta?.displayName ?? toolName,
        description: meta?.description ?? null,
        enabled: true,
        config: {},
      };
    }),
  );
}

async function syncAgentPhoneNumber(
  organizationId: string,
  agentId: string,
  phoneNumberId: string | null | undefined,
) {
  if (isDemoMode()) {
    const store = getDemoStore();
    if (!phoneNumberId) return;
    const phone = store.phoneNumbers.find((item) => item.id === phoneNumberId);
    if (phone) {
      phone.status = "assigned";
      phone.updated_at = new Date().toISOString();
    }
    return;
  }

  const supabase = await createClient();
  await supabase.from("agent_phone_numbers").delete().eq("agent_id", agentId);

  if (!phoneNumberId) return;

  await supabase.from("agent_phone_numbers").insert({
    organization_id: organizationId,
    agent_id: agentId,
    phone_number_id: phoneNumberId,
    is_primary: true,
  });

  await supabase
    .from("phone_numbers")
    .update({ status: "assigned" })
    .eq("id", phoneNumberId)
    .eq("organization_id", organizationId);
}

export async function createAgent(
  organizationId: string,
  values: AgentFormValues,
): Promise<AgentWithRelations> {
  const row = toAgentRow(organizationId, values);
  const timestamp = new Date().toISOString();

  if (isDemoMode()) {
    const agent: Agent = {
      ...(row as Agent),
      id: randomUUID(),
      created_at: timestamp,
      updated_at: timestamp,
    };
    getDemoStore().agents.unshift(agent);
    await syncAgentTools(organizationId, agent.id, values.enabled_tools);
    await syncAgentPhoneNumber(organizationId, agent.id, values.phone_number_id);
    const created = await getAgent(organizationId, agent.id);
    if (!created) throw new Error("Failed to create agent");
    return created;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create agent");
  }

  await syncAgentTools(organizationId, data.id, values.enabled_tools);
  await syncAgentPhoneNumber(organizationId, data.id, values.phone_number_id);
  const created = await getAgent(organizationId, data.id);
  if (!created) throw new Error("Failed to load created agent");
  return created;
}

export async function updateAgent(
  organizationId: string,
  agentId: string,
  values: AgentFormValues,
): Promise<AgentWithRelations> {
  const existing = await getAgent(organizationId, agentId);
  if (!existing) {
    throw new Error("Agent not found");
  }

  const row = toAgentRow(organizationId, values, existing);
  const timestamp = new Date().toISOString();

  if (isDemoMode()) {
    const store = getDemoStore();
    const index = store.agents.findIndex((agent) => agent.id === agentId);
    store.agents[index] = {
      ...existing,
      ...row,
      id: agentId,
      updated_at: timestamp,
    };
    await syncAgentTools(organizationId, agentId, values.enabled_tools);
    await syncAgentPhoneNumber(organizationId, agentId, values.phone_number_id);
    const updated = await getAgent(organizationId, agentId);
    if (!updated) throw new Error("Failed to update agent");
    return updated;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update(row)
    .eq("id", agentId)
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  await syncAgentTools(organizationId, agentId, values.enabled_tools);
  await syncAgentPhoneNumber(organizationId, agentId, values.phone_number_id);
  const updated = await getAgent(organizationId, agentId);
  if (!updated) throw new Error("Failed to load updated agent");
  return updated;
}

export async function setAgentStatus(
  organizationId: string,
  agentId: string,
  status: Agent["status"],
): Promise<AgentWithRelations> {
  const agent = await getAgent(organizationId, agentId);
  if (!agent) throw new Error("Agent not found");

  if (isDemoMode()) {
    agent.status = status;
    agent.updated_at = new Date().toISOString();
    return agent;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ status })
    .eq("id", agentId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  return { ...agent, status };
}

export function agentToFormValues(agent: AgentWithRelations): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description,
    avatar_url: agent.avatar_url ?? "",
    status: agent.status,
    voice: agent.voice,
    language: agent.language,
    additional_languages: agent.additional_languages,
    greeting_message: agent.greeting_message,
    system_prompt: agent.system_prompt,
    business_description: agent.business_description,
    objective: agent.objective,
    conversation_style: agent.conversation_style,
    speaking_speed: Number(agent.speaking_speed),
    interruption_handling: (agent.interruption_handling as AgentFormValues["interruption_handling"]) || "balanced",
    max_call_duration_seconds: agent.max_call_duration_seconds,
    silence_timeout_seconds: agent.silence_timeout_seconds,
    transfer_phone_number: agent.transfer_phone_number ?? "",
    transfer_conditions: agent.transfer_conditions,
    business_hours: (agent.business_hours as AgentFormValues["business_hours"]) ?? null,
    emergency_transfer_enabled: agent.emergency_transfer_enabled,
    sms_follow_up_enabled: agent.sms_follow_up_enabled,
    enabled_tools: agent.tools.filter((tool) => tool.enabled).map((tool) => tool.tool_name),
    phone_number_id: agent.phoneNumbers[0]?.id ?? null,
    knowledge_notes: agent.business_description,
  };
}
