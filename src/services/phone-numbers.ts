import { randomUUID } from "crypto";

import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { PhoneNumber, TelecomProvider } from "@/types";

export async function listPhoneNumbers(organizationId: string): Promise<PhoneNumber[]> {
  if (isDemoMode()) {
    return getDemoStore().phoneNumbers.filter(
      (phone) => phone.organization_id === organizationId,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phone_numbers")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PhoneNumber[];
}

export async function purchasePhoneNumber(input: {
  organizationId: string;
  e164: string;
  countryCode?: string;
  friendlyName?: string;
  provider?: TelecomProvider;
  providerSid?: string;
}): Promise<PhoneNumber> {
  const timestamp = new Date().toISOString();
  const phone: PhoneNumber = {
    id: randomUUID(),
    organization_id: input.organizationId,
    provider: input.provider ?? "twilio",
    e164: input.e164,
    friendly_name: input.friendlyName ?? null,
    country_code: input.countryCode ?? "US",
    capabilities: ["voice", "sms"],
    status: "available",
    provider_sid: input.providerSid ?? null,
    inbound_enabled: true,
    outbound_caller_id_enabled: true,
    forwarding_number: null,
    human_fallback_number: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (isDemoMode()) {
    getDemoStore().phoneNumbers.unshift(phone);
    return phone;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phone_numbers")
    .insert({
      organization_id: phone.organization_id,
      provider: phone.provider,
      e164: phone.e164,
      friendly_name: phone.friendly_name,
      country_code: phone.country_code,
      capabilities: phone.capabilities,
      status: phone.status,
      provider_sid: phone.provider_sid,
      inbound_enabled: true,
      outbound_caller_id_enabled: true,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to purchase number");
  return data as PhoneNumber;
}

export async function updatePhoneNumberRouting(input: {
  organizationId: string;
  phoneNumberId: string;
  inboundEnabled?: boolean;
  outboundCallerIdEnabled?: boolean;
  forwardingNumber?: string | null;
  humanFallbackNumber?: string | null;
  agentId?: string | null;
}): Promise<PhoneNumber> {
  if (isDemoMode()) {
    const store = getDemoStore();
    const phone = store.phoneNumbers.find((item) => item.id === input.phoneNumberId);
    if (!phone) throw new Error("Phone number not found");
    phone.inbound_enabled = input.inboundEnabled ?? phone.inbound_enabled;
    phone.outbound_caller_id_enabled =
      input.outboundCallerIdEnabled ?? phone.outbound_caller_id_enabled;
    phone.forwarding_number =
      input.forwardingNumber === undefined
        ? phone.forwarding_number
        : input.forwardingNumber;
    phone.human_fallback_number =
      input.humanFallbackNumber === undefined
        ? phone.human_fallback_number
        : input.humanFallbackNumber;
    phone.status = input.agentId ? "assigned" : phone.status;
    phone.updated_at = new Date().toISOString();
    return phone;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phone_numbers")
    .update({
      inbound_enabled: input.inboundEnabled,
      outbound_caller_id_enabled: input.outboundCallerIdEnabled,
      forwarding_number: input.forwardingNumber,
      human_fallback_number: input.humanFallbackNumber,
      status: input.agentId ? "assigned" : undefined,
    })
    .eq("id", input.phoneNumberId)
    .eq("organization_id", input.organizationId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to update number");

  if (input.agentId) {
    await supabase.from("agent_phone_numbers").upsert({
      organization_id: input.organizationId,
      agent_id: input.agentId,
      phone_number_id: input.phoneNumberId,
      is_primary: true,
    });
  }

  return data as PhoneNumber;
}
