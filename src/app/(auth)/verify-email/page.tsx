import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="Confirm your email to activate your Agentel AI workspace."
      footer={
        <Link href="/login" className="font-medium text-[var(--color-accent)]">
          Return to sign in
        </Link>
      }
    >
      <Alert tone="info">
        We sent a verification link
        {params.email ? (
          <>
            {" "}
            to <strong>{params.email}</strong>
          </>
        ) : null}
        . Click the link to continue to onboarding.
      </Alert>
    </AuthShell>
  );
}
