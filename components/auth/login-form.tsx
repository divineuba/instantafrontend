"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
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
      const { user } = await login({ email, password });
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
        <h1 className="text-2xl font-semibold m-0 mb-1">Log in</h1>
        <p className="text-sm text-neutral-700 m-0">
          One account for Instanta Logistics and Instanta Travels.
        </p>
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
      <Field label="Password" required htmlFor="password" error={errors.password}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setFieldError("password", validators.password())}
          invalid={!!errors.password}
        />
      </Field>

      {error && <p className="text-sm text-error m-0">{error}</p>}

      <Button type="submit" disabled={submitting} block>
        {submitting ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-sm text-neutral-700 m-0 text-center">
        New to Instanta?{" "}
        <Link href="/register" className="text-accent-700 font-medium">
          Create an account
        </Link>
      </p>
    </form>
  );
}
