import { createHmac, timingSafeEqual } from "crypto";

import type {
  CheckoutSessionParams,
  CheckoutSessionResult,
  CustomerPortalParams,
  CustomerPortalResult,
  PaymentProvider,
  UsageReportParams,
} from "@/types/providers";

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

/**
 * First payments implementation. Checkout + Customer Portal wire-up lands in Phase 7.
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";

  constructor(private readonly config: StripeConfig) {
    if (!config.secretKey) {
      throw new Error("StripePaymentProvider requires a secret key");
    }
  }

  async createCheckoutSession(
    params: CheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    void params;
    throw new Error("Stripe Checkout is implemented in Phase 7");
  }

  async createCustomerPortalSession(
    params: CustomerPortalParams,
  ): Promise<CustomerPortalResult> {
    void params;
    throw new Error("Stripe Customer Portal is implemented in Phase 7");
  }

  async reportUsage(params: UsageReportParams): Promise<void> {
    void params;
    throw new Error("Stripe usage reporting is implemented in Phase 7");
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      return false;
    }

    // Simplified local verification helper. Phase 7 will use the official Stripe SDK.
    const expected = createHmac("sha256", this.config.webhookSecret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const provided = signature.includes("=")
      ? signature.split(",").find((part) => part.startsWith("v1="))?.slice(3)
      : signature;

    if (!provided) {
      return false;
    }

    const signatureBuffer = Buffer.from(provided);
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
