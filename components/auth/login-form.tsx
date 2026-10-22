"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  AUTH_CARD_CLASS,
  AuthHeading,
  FormAlert,
  SubmitButton,
  describeAuthError,
  focusFirstInvalid,
  useSubmitGuard,
} from "@/components/auth/auth-ui";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { afterAuthPath, withNext } from "@/lib/safe-redirect";
import { useFieldErrors } from "@/lib/use-field-errors";
import { validateEmail } from "@/components/auth/validation";

type LoginField = "email" | "password";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const destination = afterAuthPath(rawNext);
  const { user, loading, setUser } = useAuth();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { pending, run } = useSubmitGuard();
  const { errors, setFieldError, validateAll } = useFieldErrors<LoginField>();
  const signedInHere = React.useRef(false);

  // Someone who is already signed in has no use for this form: send them
  // on to where they were going.
  React.useEffect(() => {
    if (!loading && user && !signedInHere.current) {
      router.replace(destination);
    }
  }, [loading, user, destination, router]);

  const validators: Record<LoginField, () => string | undefined> = {
    email: () => validateEmail(email),
    password: () => (password ? undefined : "Enter your password"),
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateAll(validators)) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current));
      return;
    }
    void run(async () => {
      setError(null);
      try {
        const { user } = await login({ email: email.trim(), password, rememberMe });
        signedInHere.current = true;
        setUser(user);
        router.replace(destination);
      } catch (err) {
        setError(describeAuthError(err));
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="login-title"
      className={AUTH_CARD_CLASS}
    >
      <AuthHeading id="login-title" title="Log in to Instanta">
        One account for Logistics, Travels, Crypto and Love.
      </AuthHeading>

      <div className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email" error={errors.email}>
          <IconInput
            id="email"
            name="email"
            type="email"
            icon="mail"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setFieldError("email", undefined);
            }}
            onBlur={() => email && setFieldError("email", validators.email())}
            invalid={!!errors.email}
            aria-describedby={fieldDescribedBy("email", { error: errors.email })}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          labelAction={
            <Link
              href={withNext("/forgot-password", rawNext)}
              className="text-[13px] text-accent-700 font-medium hover:text-accent-800 py-1"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setFieldError("password", undefined);
            }}
            invalid={!!errors.password}
            aria-describedby={fieldDescribedBy("password", { error: errors.password })}
          />
        </Field>
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-neutral-800 cursor-pointer select-none min-h-11 -my-1.5 w-fit">
        <Checkbox
          name="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Keep me logged in on this device
      </label>

      <FormAlert message={error} />

      <SubmitButton pending={pending} pendingLabel="Logging in…">
        Log in
      </SubmitButton>

      <p className="text-sm text-neutral-700 m-0 text-center">
        New to Instanta?{" "}
        <Link
          href={withNext("/register", rawNext)}
          className="text-accent-700 font-semibold hover:text-accent-800"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
