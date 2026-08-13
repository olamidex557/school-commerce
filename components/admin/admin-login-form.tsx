"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { adminLoginAction } from "@/app/admin/login/actions";
import { initialAdminLoginState } from "@/lib/auth/admin-login-state";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    adminLoginAction,
    initialAdminLoginState,
  );
  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="email">
          Email
        </label>
        <input
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 transition outline-none focus-visible:border-[#17211d] focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
        />
        {state.fieldErrors?.email ? (
          <p className="mt-2 text-sm text-red-800" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            aria-describedby={
              state.fieldErrors?.password ? "password-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.password)}
            className="w-full rounded-xl border border-black/15 bg-white py-3 pr-12 pl-4 transition outline-none focus-visible:border-[#17211d] focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isPending}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[#5b665f] outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            disabled={isPending}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {state.fieldErrors?.password ? (
          <p className="mt-2 text-sm text-red-800" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>
      {state.message ? (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211d] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        <LogIn size={17} /> {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
