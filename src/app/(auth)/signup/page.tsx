import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Spin up an organization and invite your team later."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)]">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
