import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use at least 8 characters. You’ll be signed in after updating."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
