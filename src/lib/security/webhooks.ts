import { createHmac, timingSafeEqual } from "crypto";

export function signWebhookPayload(secret: string, payload: string, timestamp: string): string {
  const body = `${timestamp}.${payload}`;
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyWebhookSignature(input: {
  secret: string;
  payload: string;
  timestamp: string;
  signature: string;
  toleranceSeconds?: number;
}): boolean {
  const tolerance = input.toleranceSeconds ?? 300;
  const ts = Number(input.timestamp);

  if (!Number.isFinite(ts)) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - ts);
  if (ageSeconds > tolerance) {
    return false;
  }

  const expected = signWebhookPayload(input.secret, input.payload, input.timestamp);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(input.signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}
