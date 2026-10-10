"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { IconInput } from "@/components/auth/icon-input";
import { ApiError } from "@/lib/api";
import { forgotPassword } from "@/lib/auth";
import { useFieldErrors } from "@/lib/use-field-errors";

type ForgotPasswordField = "email";

const CARD =
  "relative flex flex-col gap-5 p-8 sm:p-9 border border-divider rounded-2xl bg-card shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_40px_-20px_rgba(17,24,39,0.14)] w-full max-w-[440px]";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const { errors, setFieldError, validateAll } = useFieldErrors<ForgotPasswordField>();

  const validators: Record<ForgotPasswordField, () => string | undefined> = {
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter a valid email address"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setSent(true);
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

  if (sent) {
    return (
      <div className={`${CARD} text-center items-center`}>
        <span className="flex items-center justify-center size-12 rounded-full bg-accent-100 text-accent-700">
          <Icon name="mail" size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight m-0 mb-1.5">Check your email</h1>
          <p className="text-sm text-neutral-600 m-0 leading-relaxed">
            If an account exists for <strong className="text-text">{email}</strong>, we&apos;ve
            sent a link to reset your password. The link expires in 1 hour.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm text-accent-700 font-medium hover:text-accent-800 inline-flex items-center gap-1.5"
        >
          <Icon name="back" size={14} />
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={CARD}>
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight m-0 mb-1.5">Forgot your password?</h1>
        <p className="text-sm text-neutral-600 m-0">
          Enter the email on your account and we&apos;ll send you a reset link.
        </p>
      </div>

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

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={submitting} block className="h-11 text-[15px]">
        {submitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-sm text-neutral-600 m-0 text-center">
        <Link href="/login" className="text-accent-700 font-medium hover:text-accent-800 inline-flex items-center gap-1.5">
          <Icon name="back" size={14} />
          Back to log in
        </Link>
      </p>
    </form>
  );
}
