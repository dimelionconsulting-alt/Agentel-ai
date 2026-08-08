import type { SubscriptionPlan } from "@/types";

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPriceCents: number;
  includedMinutes: number;
  extraMinutePriceCents: number;
  maxAgents: number;
  maxPhoneNumbers: number;
  knowledgeStorageMb: number;
  features: string[];
}

export const plans: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For teams validating AI voice automation",
    monthlyPriceCents: 9900,
    includedMinutes: 500,
    extraMinutePriceCents: 12,
    maxAgents: 2,
    maxPhoneNumbers: 2,
    knowledgeStorageMb: 250,
    features: [
      "2 AI agents",
      "2 phone numbers",
      "500 included minutes",
      "Call transcripts & summaries",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing support and sales teams",
    monthlyPriceCents: 29900,
    includedMinutes: 2500,
    extraMinutePriceCents: 10,
    maxAgents: 10,
    maxPhoneNumbers: 10,
    knowledgeStorageMb: 2000,
    features: [
      "10 AI agents",
      "10 phone numbers",
      "2,500 included minutes",
      "Appointment booking & lead capture",
      "Integrations marketplace",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For multi-team organizations with higher volume",
    monthlyPriceCents: 79900,
    includedMinutes: 10000,
    extraMinutePriceCents: 8,
    maxAgents: 50,
    maxPhoneNumbers: 50,
    knowledgeStorageMb: 10000,
    features: [
      "50 AI agents",
      "50 phone numbers",
      "10,000 included minutes",
      "Advanced analytics",
      "Webhook + REST API access",
      "SSO-ready security controls",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom limits, SIP providers, and dedicated support",
    monthlyPriceCents: 0,
    includedMinutes: 0,
    extraMinutePriceCents: 0,
    maxAgents: 0,
    maxPhoneNumbers: 0,
    knowledgeStorageMb: 0,
    features: [
      "Custom agent & number limits",
      "Custom minute pricing",
      "European SIP / telecom providers",
      "Dedicated success manager",
      "Custom data retention & DPA",
      "SLA & security review",
    ],
  },
];

export function getPlan(planId: SubscriptionPlan): PlanDefinition {
  const plan = plans.find((item) => item.id === planId);
  if (!plan) {
    throw new Error(`Unknown plan: ${planId}`);
  }
  return plan;
}
