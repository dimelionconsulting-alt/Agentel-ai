import { StripePaymentProvider } from "./StripePaymentProvider";
import type { PaymentProvider } from "./PaymentProvider";

export * from "./PaymentProvider";
export * from "./StripePaymentProvider";

export function createPaymentProvider(): PaymentProvider {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new StripePaymentProvider({ secretKey, webhookSecret });
}
