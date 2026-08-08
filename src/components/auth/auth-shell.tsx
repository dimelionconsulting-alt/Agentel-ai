import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.12),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef6f8_45%,#f8fafc_100%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-sm font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Agentel AI
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
          {children}
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">{footer}</div> : null}
      </div>
    </div>
  );
}
