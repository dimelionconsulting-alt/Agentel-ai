import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAuthContext } from "@/lib/auth/session";
import { listAgents } from "@/services/agents";
import {
  listPhoneNumbers,
  purchasePhoneNumber,
  updatePhoneNumberRouting,
} from "@/services/phone-numbers";
import { createTelephonyProvider } from "@/providers/telephony";

export const metadata = { title: "Phone Numbers" };

export default async function PhoneNumbersPage() {
  const auth = await requireAuthContext();
  const organizationId = auth.activeOrganization.organization.id;
  const [numbers, agents] = await Promise.all([
    listPhoneNumbers(organizationId),
    listAgents(organizationId),
  ]);

  async function buyNumberAction(formData: FormData) {
    "use server";
    const context = await requireAuthContext();
    const orgId = context.activeOrganization.organization.id;
    const country = String(formData.get("country") || "US");
    const areaCode = String(formData.get("areaCode") || "");

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const telephony = createTelephonyProvider();
      const purchased = await telephony.purchaseNumber({
        country,
        areaCode: areaCode || undefined,
      });
      await purchasePhoneNumber({
        organizationId: orgId,
        e164: purchased.e164,
        countryCode: country,
        friendlyName: purchased.friendlyName,
        providerSid: purchased.providerSid,
      });
    } else {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      await purchasePhoneNumber({
        organizationId: orgId,
        e164: `+1555010${suffix}`,
        countryCode: country,
        friendlyName: "Demo number",
        providerSid: `PNdemo${suffix}`,
      });
    }

    revalidatePath("/phone-numbers");
  }

  async function assignAction(formData: FormData) {
    "use server";
    const context = await requireAuthContext();
    await updatePhoneNumberRouting({
      organizationId: context.activeOrganization.organization.id,
      phoneNumberId: String(formData.get("phoneNumberId")),
      agentId: String(formData.get("agentId") || "") || null,
      humanFallbackNumber: String(formData.get("humanFallbackNumber") || "") || null,
      forwardingNumber: String(formData.get("forwardingNumber") || "") || null,
      inboundEnabled: formData.get("inboundEnabled") === "on",
      outboundCallerIdEnabled: formData.get("outboundCallerIdEnabled") === "on",
    });
    revalidatePath("/phone-numbers");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phone Numbers"
        description="Purchase, assign, and route telephone numbers. Provider-agnostic storage supports Twilio today and SIP later."
      />

      <Card>
        <CardHeader>
          <CardTitle>Purchase number</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={buyNumberAction} className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue="US" />
            </div>
            <div>
              <Label htmlFor="areaCode">Area code</Label>
              <Input id="areaCode" name="areaCode" placeholder="415" />
            </div>
            <div className="flex items-end">
              <Button type="submit">Purchase</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {numbers.map((phone) => (
          <Card key={phone.id}>
            <CardContent className="space-y-4 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">{phone.e164}</div>
                  <div className="text-sm text-[var(--color-ink-muted)]">
                    {phone.friendly_name ?? "Untitled"} · {phone.provider}
                  </div>
                </div>
                <Badge tone={phone.status === "assigned" ? "success" : "neutral"}>
                  {phone.status}
                </Badge>
              </div>
              <form action={assignAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="phoneNumberId" value={phone.id} />
                <div>
                  <Label htmlFor={`agent-${phone.id}`}>Assign agent</Label>
                  <select
                    id={`agent-${phone.id}`}
                    name="agentId"
                    defaultValue=""
                    className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`fallback-${phone.id}`}>Human fallback</Label>
                  <Input
                    id={`fallback-${phone.id}`}
                    name="humanFallbackNumber"
                    defaultValue={phone.human_fallback_number ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor={`forward-${phone.id}`}>Call forwarding</Label>
                  <Input
                    id={`forward-${phone.id}`}
                    name="forwardingNumber"
                    defaultValue={phone.forwarding_number ?? ""}
                  />
                </div>
                <div className="flex flex-col justify-end gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="inboundEnabled"
                      defaultChecked={phone.inbound_enabled}
                    />
                    Inbound routing
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="outboundCallerIdEnabled"
                      defaultChecked={phone.outbound_caller_id_enabled}
                    />
                    Outbound caller ID
                  </label>
                  <Button type="submit" size="sm">
                    Save routing
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
