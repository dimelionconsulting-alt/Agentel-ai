import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to choose a new password."
      footer={
        <Link href="/login" className="font-medium text-[var(--color-accent)]">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
