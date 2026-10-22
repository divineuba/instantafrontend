"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/button";
import {
  PASSWORD_MIN_LENGTH,
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/auth/password-input";
import {
  AUTH_CARD_CLASS,
  AuthHeading,
  AuthStatus,
  FormAlert,
  SubmitButton,
  describeAuthError,
  focusFirstInvalid,
  useSubmitGuard,
} from "@/components/auth/auth-ui";
import { ApiError } from "@/lib/api";
import { resetPassword } from "@/lib/auth";
import { useFieldErrors } from "@/lib/use-field-errors";

type ResetPasswordField = "password" | "confirmPassword";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [linkExpired, setLinkExpired] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { pending, run } = useSubmitGuard();
  const { errors, setFieldError, validateAll } = useFieldErrors<ResetPasswordField>();

  const validators: Record<ResetPasswordField, () => string | undefined> = {
    password: () =>
      password.length >= PASSWORD_MIN_LENGTH
        ? undefined
        : `Use at least ${PASSWORD_MIN_LENGTH} characters`,
    confirmPassword: () =>
      !confirmPassword
        ? "Type the new password again"
        : confirmPassword === password
          ? undefined
          : "The passwords don't match",
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!validateAll(validators)) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current));
      return;
    }
    void run(async () => {
      setError(null);
      try {
        await resetPassword({ token, password });
        setDone(true);
      } catch (err) {
        // A 400 here means the token is unknown, used or past its hour.
        setLinkExpired(err instanceof ApiError && err.status === 400);
        setError(describeAuthError(err));
      }
    });
  }

  if (!token) {
    return (
      <AuthStatus
        icon="alert"
        tone="error"
        title="This reset link is incomplete"
        actions={
          <LinkButton
            href="/forgot-password"
            variant="primary"
            className="min-h-12 text-[15px] w-full"
          >
            Request a new link
          </LinkButton>
        }
      >
        <p className="m-0">
          The link is missing part of its code. Open it straight from the
          email, or request a new one.
        </p>
      </AuthStatus>
    );
  }

  if (done) {
    return (
      <AuthStatus
        icon="check"
        tone="success"
        title="Password changed"
        actions={
          <LinkButton href="/login" variant="primary" className="min-h-12 text-[15px] w-full">
            Log in with your new password
          </LinkButton>
        }
      >
        <p className="m-0" role="status">
          For your security we&apos;ve signed you out on every device. Log in
          again with your new password.
        </p>
      </AuthStatus>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="reset-title"
      className={AUTH_CARD_CLASS}
    >
      <AuthHeading id="reset-title" title="Choose a new password">
        Pick one you don&apos;t use anywhere else.
      </AuthHeading>

      <div className="flex flex-col gap-4">
        <Field label="New password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password && e.target.value.length >= PASSWORD_MIN_LENGTH) {
                setFieldError("password", undefined);
              }
            }}
            invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error password-rules" : "password-rules"
            }
          />
          <PasswordStrengthMeter id="password-rules" password={password} />
        </Field>
        <Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setFieldError("confirmPassword", undefined);
            }}
            onBlur={() =>
              confirmPassword && setFieldError("confirmPassword", validators.confirmPassword())
            }
            invalid={!!errors.confirmPassword}
            aria-describedby={fieldDescribedBy("confirmPassword", {
              error: errors.confirmPassword,
            })}
          />
        </Field>
      </div>

      <FormAlert message={error}>
        {linkExpired && (
          <Link href="/forgot-password" className="font-semibold text-inherit underline">
            Request a new reset link
          </Link>
        )}
      </FormAlert>

      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}
