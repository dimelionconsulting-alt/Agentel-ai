import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export function ModulePlaceholder({
  title,
  description,
  phase,
  bullets,
}: {
  title: string;
  description: string;
  phase: string;
  bullets: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} is scaffolded for ${phase}`}
        description="The navigation, multi-tenant data model, and provider abstractions are in place. Feature implementation lands in the planned delivery phase."
        action={
          <div className="space-y-3">
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-muted)]">
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
            >
              Back to dashboard
            </Link>
          </div>
        }
      />
    </div>
  );
}
