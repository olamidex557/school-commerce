"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type AdminLoginActionState } from "@/lib/auth/admin-login-state";
import { GENERIC_ADMIN_LOGIN_ERROR } from "@/lib/auth/login-security";
import { adminLoginRateLimiter } from "@/lib/security/login-rate-limit";
import { createClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validation/admin-auth";

function hashEmail(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

async function requestIpAddress() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded && forwarded.length <= 64 ? forwarded : "unknown";
}

export async function adminLoginAction(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: {
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const ipAddress = await requestIpAddress();
  const emailHash = hashEmail(email);
  const rateLimit = adminLoginRateLimiter.consume([
    `ip:${ipAddress}`,
    `email:${emailHash}`,
    `combined:${ipAddress}:${emailHash}`,
  ]);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message:
        "Too many sign-in attempts. Please wait a few minutes and try again.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { status: "error", message: GENERIC_ADMIN_LOGIN_ERROR };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    await supabase.auth.signOut();
    return { status: "error", message: GENERIC_ADMIN_LOGIN_ERROR };
  }

  redirect("/admin");
}
