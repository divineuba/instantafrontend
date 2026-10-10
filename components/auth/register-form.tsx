"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { registerAccount } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useFieldErrors } from "@/lib/use-field-errors";

type RegisterField = "firstName" | "lastName" | "email" | "password";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<RegisterField>();

  const canSubmit = Boolean(
    firstName && lastName && email && password.length >= 8,
  );

  const validators: Record<RegisterField, () => string | undefined> = {
    firstName: () => (firstName.trim() ? undefined : "First name is required"),
    lastName: () => (lastName.trim() ? undefined : "Last name is required"),
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter a valid email address"),
    password: () => (password.length >= 8 ? undefined : "Password must be at least 8 characters"),
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
      className="flex flex-col gap-4 p-7 border border-divider rounded-xl bg-card w-full max-w-[420px]"
    >
      <div>
        <h1 className="text-2xl font-semibold m-0 mb-1">Create your account</h1>
        <p className="text-sm text-neutral-700 m-0">
          Book deliveries and flights, and track everything from one place.
        </p>
      </div>

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
        <Input
          id="email"
          type="email"
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
        hint="At least 8 characters"
        error={errors.password}
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setFieldError("password", validators.password())}
          invalid={!!errors.password}
        />
      </Field>

      {error && <p className="text-sm text-error m-0">{error}</p>}

      <Button type="submit" disabled={!canSubmit || submitting} block>
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-sm text-neutral-700 m-0 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-700 font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
