import { plans } from "@/config/plans";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Subscription plans are defined now. Stripe Checkout and Customer Portal arrive in Phase 7."
      />
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
            <CardContent>
              <p className="text-2xl font-semibold text-[var(--color-ink)]">
                {plan.monthlyPriceCents === 0
                  ? "Custom"
                  : `${formatCurrency(plan.monthlyPriceCents)}/mo`}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-muted)]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
