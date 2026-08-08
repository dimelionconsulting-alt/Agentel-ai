"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({
  open,
  onClose,
  organizationName,
}: {
  open: boolean;
  onClose: () => void;
  organizationName: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/30 transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-bold text-white">
                V
              </span>
              <div>
                <div className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
                  Voxora AI
                </div>
                <div className="text-xs text-[var(--color-ink-subtle)]">{organizationName}</div>
              </div>
            </Link>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-[var(--color-ink-muted)] hover:bg-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {mainNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)]"
                    : "text-[var(--color-ink-muted)] hover:bg-white/70 hover:text-[var(--color-ink)]",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-[var(--color-accent)]" : "text-[var(--color-ink-subtle)]",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
