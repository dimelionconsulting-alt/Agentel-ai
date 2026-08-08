export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
}

export interface AppointmentInput {
  organizationId: string;
  agentId?: string;
  contactId?: string;
  callId?: string;
  title: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  notes?: string;
}

/**
 * Generic appointment booking tool surface for AI agents.
 * Concrete calendar providers plug in during Phase 6.
 */
export async function checkAvailability(input: {
  organizationId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
}): Promise<AvailabilitySlot[]> {
  void input;
  throw new Error("checkAvailability is implemented in Phase 6");
}

export async function createAppointment(input: AppointmentInput): Promise<{ id: string }> {
  void input;
  throw new Error("createAppointment is implemented in Phase 6");
}

export async function rescheduleAppointment(input: {
  appointmentId: string;
  startsAt: string;
  endsAt: string;
}): Promise<void> {
  void input;
  throw new Error("rescheduleAppointment is implemented in Phase 6");
}

export async function cancelAppointment(input: { appointmentId: string }): Promise<void> {
  void input;
  throw new Error("cancelAppointment is implemented in Phase 6");
}
