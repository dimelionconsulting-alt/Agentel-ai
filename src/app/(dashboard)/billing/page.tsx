import { plans } from "@/config/plans";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { requireAuthContext } from "@/lib/auth/session";
import { createPaymentProvider } from "@/providers/payments";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const auth = await requireAuthContext();

  async function checkoutAction(formData: FormData) {
    "use server";
    const context = await requireAuthContext();
    const plan = String(formData.get("plan") || "starter");
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";

    if (!process.env.STRIPE_SECRET_KEY) {
      return;
    }

    const payments = createPaymentProvider();
    const session = await payments.createCheckoutSession({
      organizationId: context.activeOrganization.organization.id,
      plan,
      successUrl: `${appUrl}/billing?checkout=success`,
      cancelUrl: `${appUrl}/billing?checkout=cancel`,
      customerEmail: context.user.email,
    });

    const { redirect } = await import("next/navigation");
    redirect(session.url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Subscription plans with included minutes, agent limits, and usage-based overages."
      />

      {!process.env.STRIPE_SECRET_KEY ? (
        <Alert tone="info">
          Stripe keys are not configured. Checkout buttons stay disabled until
          `STRIPE_SECRET_KEY` and plan price IDs are set.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                {plan.id === "professional" ? <Badge tone="info">Popular</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-semibold text-[var(--color-ink)]">
                {plan.monthlyPriceCents === 0
                  ? "Custom"
                  : `${formatCurrency(plan.monthlyPriceCents)}/mo`}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              {plan.id !== "enterprise" ? (
                <form action={checkoutAction}>
                  <input type="hidden" name="plan" value={plan.id} />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!process.env.STRIPE_SECRET_KEY}
                  >
                    Choose {plan.name}
                  </Button>
                </form>
              ) : (
                <Button className="w-full" variant="secondary" disabled>
                  Contact sales
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-5 text-sm text-[var(--color-ink-muted)]">
          Signed-in organization: {auth.activeOrganization.organization.name}. Usage-based
          overage billing reports through `StripePaymentProvider.reportUsage()`.
        </CardContent>
      </Card>
    </div>
  );
}
