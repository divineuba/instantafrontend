"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput } from "@/components/auth/password-input";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useFieldErrors } from "@/lib/use-field-errors";

type LoginField = "email" | "password";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<LoginField>();

  const validators: Record<LoginField, () => string | undefined> = {
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter a valid email address"),
    password: () => (password ? undefined : "Password is required"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await login({ email, password, rememberMe });
      setUser(user);
      router.push(searchParams.get("next") ?? "/account");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-5 p-8 sm:p-9 border border-divider rounded-2xl bg-card shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_40px_-20px_rgba(17,24,39,0.14)] w-full max-w-[440px]"
    >
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight m-0 mb-1.5">Log in</h1>
        <p className="text-sm text-neutral-600 m-0">
          One account for Instanta Logistics and Instanta Travels.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Email" required htmlFor="email" error={errors.email}>
          <IconInput
            id="email"
            type="email"
            icon="mail"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setFieldError("email", validators.email())}
            invalid={!!errors.email}
          />
        </Field>
        <Field
          label="Password"
          required
          htmlFor="password"
          error={errors.password}
          labelAction={
            <Link href="/forgot-password" className="text-xs text-accent-700 font-medium hover:text-accent-800">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldError("password", validators.password())}
            invalid={!!errors.password}
          />
        </Field>
      </div>

      <label className="inline-flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer select-none">
        <Checkbox
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me on this device
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={submitting} block className="h-11 text-[15px]">
        {submitting ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-sm text-neutral-600 m-0 text-center pt-1 border-t border-divider">
        <span className="inline-block pt-4">
          New to Instanta?{" "}
          <Link href="/register" className="text-accent-700 font-medium hover:text-accent-800">
            Create an account
          </Link>
        </span>
      </p>
    </form>
  );
}
