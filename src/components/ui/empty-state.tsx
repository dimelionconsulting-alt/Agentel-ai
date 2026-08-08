import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 py-10">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-muted)]">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
