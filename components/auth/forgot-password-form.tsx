"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Field, fieldDescribedBy } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import { IconInput } from "@/components/auth/icon-input";
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
import { validateEmail } from "@/components/auth/validation";
import { forgotPassword } from "@/lib/auth";
import { withNext } from "@/lib/safe-redirect";
import { useFieldErrors } from "@/lib/use-field-errors";

type ForgotPasswordField = "email";

/**
 * The backend answers this request the same way whether or not the email
 * has an account (so it can't be used to find out who's registered), and
 * the confirmation here is worded to match: it never says an account exists.
 */
export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const { pending, run } = useSubmitGuard();
  const { errors, setFieldError, validateAll } = useFieldErrors<ForgotPasswordField>();

  const validators: Record<ForgotPasswordField, () => string | undefined> = {
    email: () => validateEmail(email),
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
        const trimmed = email.trim();
        await forgotPassword({ email: trimmed });
        setSentTo(trimmed);
      } catch (err) {
        setError(describeAuthError(err));
      }
    });
  }

  if (sentTo) {
    return (
      <AuthStatus
        icon="mail"
        title="Check your email"
        actions={
          <>
            <LinkButton
              href={withNext("/login", rawNext)}
              variant="primary"
              className="min-h-12 text-[15px] w-full"
            >
              Back to log in
            </LinkButton>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="min-h-11 text-sm font-medium text-accent-700 hover:text-accent-800 bg-transparent border-0 cursor-pointer"
            >
              Use a different email
            </button>
          </>
        }
      >
        <p className="m-0" role="status">
          If <strong className="text-text break-all">{sentTo}</strong> has an
          Instanta account, we&apos;ve sent it a link to reset the password.
          The link works for 1 hour.
        </p>
        <p className="m-0 mt-2 text-sm text-neutral-600">
          Nothing after a few minutes? Check your spam folder, or make sure
          you typed the email you signed up with.
        </p>
      </AuthStatus>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="forgot-title"
      className={AUTH_CARD_CLASS}
    >
      <AuthHeading id="forgot-title" title="Reset your password">
        Enter the email you use for Instanta and we&apos;ll send you a link to
        choose a new password.
      </AuthHeading>

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

      <FormAlert message={error} />

      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>

      <Link
        href={withNext("/login", rawNext)}
        className="self-center min-h-11 inline-flex items-center gap-1.5 text-sm text-accent-700 font-semibold hover:text-accent-800"
      >
        <Icon name="back" size={15} aria-hidden="true" />
        Back to log in
      </Link>
    </form>
  );
}
