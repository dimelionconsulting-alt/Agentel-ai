"use client";

import { Menu } from "lucide-react";

import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Topbar({
  onMenuClick,
  userName,
  userEmail,
  role,
  demoMode,
}: {
  onMenuClick: () => void;
  userName: string;
  userEmail: string;
  role: string;
  demoMode: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-canvas)]/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-[var(--color-border)] bg-white p-2 text-[var(--color-ink-muted)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-[var(--color-ink)]">{userName}</p>
          <p className="text-xs text-[var(--color-ink-subtle)]">{userEmail}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {demoMode ? <Badge tone="warning">Demo mode</Badge> : null}
        <Badge tone="info">{role.replace("_", " ")}</Badge>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
