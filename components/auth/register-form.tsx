"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { ApiError } from "@/lib/api";
import { registerAccount } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useFieldErrors } from "@/lib/use-field-errors";

type RegisterField = "firstName" | "lastName" | "email" | "password" | "terms";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<RegisterField>();

  const canSubmit = Boolean(
    firstName && lastName && email && password.length >= 8 && acceptedTerms,
  );

  const validators: Record<RegisterField, () => string | undefined> = {
    firstName: () => (firstName.trim() ? undefined : "First name is required"),
    lastName: () => (lastName.trim() ? undefined : "Last name is required"),
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter a valid email address"),
    password: () => (password.length >= 8 ? undefined : "Password must be at least 8 characters"),
    terms: () => (acceptedTerms ? undefined : "You must accept the Terms and Privacy Policy"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await registerAccount({
        firstName,
        lastName,
        email,
        password,
      });
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
        <h1 className="text-[26px] font-semibold tracking-tight m-0 mb-1.5">Create your account</h1>
        <p className="text-sm text-neutral-600 m-0">
          Book deliveries and flights, and track everything from one place.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" required htmlFor="firstName" error={errors.firstName}>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setFieldError("firstName", validators.firstName())}
              invalid={!!errors.firstName}
            />
          </Field>
          <Field label="Last name" required htmlFor="lastName" error={errors.lastName}>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setFieldError("lastName", validators.lastName())}
              invalid={!!errors.lastName}
            />
          </Field>
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
        <Field
          label="Password"
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
      </div>

      <div>
        <label className="inline-flex items-start gap-2.5 text-sm cursor-pointer select-none">
          <span className="mt-0.5">
            <Checkbox
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setFieldError("terms", undefined);
              }}
            />
          </span>
          <span className="text-neutral-700">
            I agree to the{" "}
            <Link href="/terms" className="text-accent-700 font-medium hover:text-accent-800" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent-700 font-medium hover:text-accent-800" target="_blank">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-error m-0 mt-1.5">{errors.terms}</p>}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={!canSubmit || submitting} block className="h-11 text-[15px]">
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-sm text-neutral-600 m-0 text-center pt-1 border-t border-divider">
        <span className="inline-block pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-700 font-medium hover:text-accent-800">
            Log in
          </Link>
        </span>
      </p>
    </form>
  );
}
