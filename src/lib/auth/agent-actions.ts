"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthContext } from "@/lib/auth/session";
import { agentFormSchema } from "@/lib/validations/agents";
import {
  createAgent,
  setAgentStatus,
  updateAgent,
} from "@/services/agents";
import type { AgentStatus } from "@/types";

export type AgentActionResult = {
  success: boolean;
  error?: string;
  agentId?: string;
};

function formDataToObject(formData: FormData) {
  const additionalLanguages = String(formData.get("additional_languages") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const transferConditions = String(formData.get("transfer_conditions") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const enabledTools = String(formData.get("enabled_tools") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    name: formData.get("name"),
    description: formData.get("description"),
    avatar_url: formData.get("avatar_url"),
    status: formData.get("status") || "draft",
    voice: formData.get("voice") || "alloy",
    language: formData.get("language") || "en",
    additional_languages: additionalLanguages,
    greeting_message: formData.get("greeting_message"),
    system_prompt: formData.get("system_prompt"),
    business_description: formData.get("business_description"),
    objective: formData.get("objective"),
    conversation_style: formData.get("conversation_style"),
    speaking_speed: formData.get("speaking_speed") || 1,
    interruption_handling: formData.get("interruption_handling") || "balanced",
    max_call_duration_seconds: formData.get("max_call_duration_seconds") || 1800,
    silence_timeout_seconds: formData.get("silence_timeout_seconds") || 10,
    transfer_phone_number: formData.get("transfer_phone_number"),
    transfer_conditions: transferConditions,
    emergency_transfer_enabled: formData.get("emergency_transfer_enabled") === "true",
    sms_follow_up_enabled: formData.get("sms_follow_up_enabled") === "true",
    enabled_tools: enabledTools,
    phone_number_id: formData.get("phone_number_id") || null,
    knowledge_notes: formData.get("knowledge_notes"),
    business_hours: formData.get("business_hours")
      ? JSON.parse(String(formData.get("business_hours")))
      : undefined,
  };
}

export async function saveAgentAction(
  formData: FormData,
): Promise<AgentActionResult> {
  const auth = await requireAuthContext();
  const agentId = String(formData.get("agentId") || "");
  const parsed = agentFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid agent configuration",
    };
  }

  try {
    const agent = agentId
      ? await updateAgent(auth.activeOrganization.organization.id, agentId, parsed.data)
      : await createAgent(auth.activeOrganization.organization.id, parsed.data);

    revalidatePath("/agents");
    revalidatePath(`/agents/${agent.id}`);
    redirect(`/agents/${agent.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to save agent",
    };
  }
}

export async function updateAgentStatusAction(
  agentId: string,
  status: AgentStatus,
): Promise<AgentActionResult> {
  const auth = await requireAuthContext();

  try {
    await setAgentStatus(auth.activeOrganization.organization.id, agentId, status);
    revalidatePath("/agents");
    revalidatePath(`/agents/${agentId}`);
    return { success: true, agentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to update status",
    };
  }
}
