import { TwilioTelephonyProvider } from "./TwilioTelephonyProvider";
import type { TelephonyProvider } from "./TelephonyProvider";

export * from "./TelephonyProvider";
export * from "./TwilioTelephonyProvider";
export * from "./types";

export function createTelephonyProvider(): TelephonyProvider {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
  }

  return new TwilioTelephonyProvider({ accountSid, authToken });
}
