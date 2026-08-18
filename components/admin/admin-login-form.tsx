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
          className="form-input"
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
            className="form-input pr-12"
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
            className="admin-button-ghost admin-button-icon focus-ring absolute top-1/2 right-2 -translate-y-1/2"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            disabled={isPending}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {state.fieldErrors?.password ? (
          <p className="form-error" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>
      {state.message ? (
        <p className="alert-error px-4 py-3 text-sm" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        className="admin-button-primary admin-button-lg focus-ring w-full"
        type="submit"
        disabled={isPending}
      >
        <LogIn size={17} /> {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
