import { NextResponse } from "next/server";

import { authenticateApiRequest } from "@/lib/api/auth";
import { listPhoneNumbers } from "@/services/phone-numbers";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const phoneNumbers = await listPhoneNumbers(auth.organizationId);
  return NextResponse.json({ data: phoneNumbers });
}
