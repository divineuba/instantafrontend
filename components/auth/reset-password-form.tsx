"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { ApiError } from "@/lib/api";
import { resetPassword } from "@/lib/auth";
import { useFieldErrors } from "@/lib/use-field-errors";

type ResetPasswordField = "password" | "confirmPassword";

const CARD =
  "relative flex flex-col gap-5 p-8 sm:p-9 border border-divider rounded-2xl bg-card shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_40px_-20px_rgba(17,24,39,0.14)] w-full max-w-[440px]";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const { errors, setFieldError, validateAll } = useFieldErrors<ResetPasswordField>();

  const validators: Record<ResetPasswordField, () => string | undefined> = {
    password: () => (password.length >= 8 ? undefined : "Password must be at least 8 characters"),
    confirmPassword: () => (confirmPassword === password ? undefined : "Passwords don't match"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ token, password });
      setDone(true);
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

  if (!token) {
    return (
      <div className={`${CARD} text-center items-center`}>
        <span className="flex items-center justify-center size-12 rounded-full bg-error/10 text-error">
          <Icon name="alert" size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight m-0 mb-1.5">Invalid reset link</h1>
          <p className="text-sm text-neutral-600 m-0">
            This link is missing its reset token. Request a new one below.
          </p>
        </div>
        <Link href="/forgot-password" className="text-sm text-accent-700 font-medium hover:text-accent-800">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${CARD} text-center items-center`}>
        <span className="flex items-center justify-center size-12 rounded-full bg-accent-100 text-accent-700">
          <Icon name="check" size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight m-0 mb-1.5">Password reset</h1>
          <p className="text-sm text-neutral-600 m-0 leading-relaxed">
            Your password has been updated. You&apos;ve been signed out of every device for
            your security &mdash; log in again with your new password.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} block className="h-11 text-[15px]">
          Log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={CARD}>
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight m-0 mb-1.5">Reset your password</h1>
        <p className="text-sm text-neutral-600 m-0">Choose a new password for your account.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Field
          label="New password"
          required
          htmlFor="password"
          hint={password ? undefined : "At least 8 characters"}
          error={errors.password}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldError("password", validators.password())}
            invalid={!!errors.password}
          />
          <PasswordStrengthMeter password={password} />
        </Field>
        <Field
          label="Confirm password"
          required
          htmlFor="confirmPassword"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setFieldError("confirmPassword", validators.confirmPassword())}
            invalid={!!errors.confirmPassword}
          />
        </Field>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={submitting} block className="h-11 text-[15px]">
        {submitting ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
