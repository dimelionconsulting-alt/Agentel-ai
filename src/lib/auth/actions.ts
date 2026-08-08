"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/config/env";
import { slugify } from "@/lib/utils";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Set environment variables to enable authentication.",
    };
  }

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    organizationName: formData.get("organizationName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const appUrl = getAppUrl();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/onboarding`,
      data: {
        full_name: parsed.data.fullName,
        organization_name: parsed.data.organizationName,
        organization_slug: slugify(parsed.data.organizationName),
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session) {
    redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
  }

  redirect("/onboarding");
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Set environment variables to enable authentication.",
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const next = String(formData.get("next") || "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Set environment variables to enable authentication.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const appUrl = getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Set environment variables to enable authentication.",
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
