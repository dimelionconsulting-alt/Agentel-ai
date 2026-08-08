import Stripe from "stripe";

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

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";
  private stripe: Stripe;

  constructor(private readonly config: StripeConfig) {
    if (!config.secretKey) {
      throw new Error("StripePaymentProvider requires a secret key");
    }
    this.stripe = new Stripe(config.secretKey);
  }

  async createCheckoutSession(
    params: CheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    const priceId = process.env[`STRIPE_PRICE_${params.plan.toUpperCase()}`];

    if (!priceId) {
      throw new Error(`Missing Stripe price for plan ${params.plan}`);
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer: params.stripeCustomerId,
      customer_email: params.stripeCustomerId ? undefined : params.customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        organizationId: params.organizationId,
        plan: params.plan,
      },
    });

    if (!session.url) {
      throw new Error("Stripe Checkout session did not return a URL");
    }

    return { url: session.url, sessionId: session.id };
  }

  async createCustomerPortalSession(
    params: CustomerPortalParams,
  ): Promise<CustomerPortalResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.stripeCustomerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  }

  async reportUsage(params: UsageReportParams): Promise<void> {
    // Wire to Stripe meter/usage records once meter IDs are configured per plan.
    void params;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret,
      );
      return true;
    } catch {
      return false;
    }
  }
}
