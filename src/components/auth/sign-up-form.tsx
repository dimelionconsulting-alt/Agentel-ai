"use client";

import { useState, useTransition } from "react";

import { signUpAction } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await signUpAction(formData);
          if (result?.error) {
            setError(result.error);
          }
        });
      }}
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="organizationName">Organization</Label>
        <Input id="organizationName" name="organizationName" required />
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
