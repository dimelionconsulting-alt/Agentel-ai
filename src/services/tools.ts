export interface RegisteredTool {
  name: string;
  displayName: string;
  description: string;
}

/**
 * Secure tool registry surface used by agents.
 * Integrations register callable functions here in later phases.
 */
export const systemTools: RegisteredTool[] = [
  {
    name: "check_calendar",
    displayName: "Check calendar",
    description: "Check availability in connected calendars",
  },
  {
    name: "book_appointment",
    displayName: "Book appointment",
    description: "Create a confirmed appointment after caller confirmation",
  },
  {
    name: "create_lead",
    displayName: "Create lead",
    description: "Capture a qualified lead from the conversation",
  },
  {
    name: "lookup_customer",
    displayName: "Lookup customer",
    description: "Find an existing customer record",
  },
  {
    name: "check_order_status",
    displayName: "Check order status",
    description: "Lookup order status by identifier",
  },
  {
    name: "transfer_call",
    displayName: "Transfer call",
    description: "Transfer the active call to a human",
  },
  {
    name: "send_sms",
    displayName: "Send SMS",
    description: "Send an SMS follow-up message",
  },
  {
    name: "trigger_webhook",
    displayName: "Trigger webhook",
    description: "Invoke a configured webhook endpoint",
  },
];

export function getRegisteredTool(name: string): RegisteredTool | undefined {
  return systemTools.find((tool) => tool.name === name);
}
