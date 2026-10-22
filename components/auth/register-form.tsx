"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field, Input, fieldDescribedBy } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { LinkButton } from "@/components/ui/button";
import { IconInput } from "@/components/auth/icon-input";
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
import { validateEmail } from "@/components/auth/validation";
import { ApiError } from "@/lib/api";
import { registerAccount, resendVerification } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { afterAuthPath, withNext } from "@/lib/safe-redirect";
import { useFieldErrors } from "@/lib/use-field-errors";

type RegisterField = "firstName" | "lastName" | "email" | "password" | "terms";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const destination = afterAuthPath(rawNext);
  const { user, loading, setUser } = useAuth();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [createdEmail, setCreatedEmail] = React.useState<string | null>(null);
  const { pending, run } = useSubmitGuard();
  const { errors, setFieldError, validateAll } = useFieldErrors<RegisterField>();

  // Already signed in (and not because of this form): nothing to create.
  React.useEffect(() => {
    if (!loading && user && !createdEmail) {
      router.replace(destination);
    }
  }, [loading, user, createdEmail, destination, router]);

  const validators: Record<RegisterField, () => string | undefined> = {
    firstName: () => (firstName.trim() ? undefined : "Enter your first name"),
    lastName: () => (lastName.trim() ? undefined : "Enter your last name"),
    email: () => validateEmail(email),
    password: () =>
      password.length >= PASSWORD_MIN_LENGTH
        ? undefined
        : `Use at least ${PASSWORD_MIN_LENGTH} characters`,
    terms: () =>
      acceptedTerms ? undefined : "Please accept the Terms of Service and Privacy Policy",
  };

  function clearOnEdit(field: RegisterField) {
    if (errors[field]) setFieldError(field, undefined);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateAll(validators)) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current));
      return;
    }
    void run(async () => {
      setError(null);
      setEmailTaken(false);
      try {
        const { user } = await registerAccount({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        });
        setCreatedEmail(user.email);
        setUser(user);
      } catch (err) {
        setEmailTaken(err instanceof ApiError && err.status === 409);
        setError(describeAuthError(err));
      }
    });
  }

  if (createdEmail) {
    return <AccountCreated email={createdEmail} destination={destination} />;
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="register-title"
      className={AUTH_CARD_CLASS}
    >
      <AuthHeading id="register-title" title="Create your account">
        One sign-in for sending packages, booking flights, trading crypto and
        meeting people.
      </AuthHeading>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 min-[400px]:gap-3">
          <Field label="First name" htmlFor="firstName" error={errors.firstName}>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              className="min-h-11 text-[15px]"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearOnEdit("firstName");
              }}
              invalid={!!errors.firstName}
              aria-describedby={fieldDescribedBy("firstName", { error: errors.firstName })}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              className="min-h-11 text-[15px]"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearOnEdit("lastName");
              }}
              invalid={!!errors.lastName}
              aria-describedby={fieldDescribedBy("lastName", { error: errors.lastName })}
            />
          </Field>
        </div>
        <Field
          label="Email"
          htmlFor="email"
          hint="We'll send a link to confirm it's yours."
          error={errors.email}
        >
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
              clearOnEdit("email");
              setEmailTaken(false);
            }}
            onBlur={() => email && setFieldError("email", validators.email())}
            invalid={!!errors.email}
            aria-describedby={fieldDescribedBy("email", {
              hint: true,
              error: errors.email,
            })}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
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
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm cursor-pointer select-none py-1">
          <span className="mt-px">
            <Checkbox
              id="terms"
              name="terms"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setFieldError("terms", undefined);
              }}
              aria-invalid={!!errors.terms || undefined}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
          </span>
          <span className="text-neutral-800 leading-snug">
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-accent-700 font-medium underline underline-offset-2 hover:text-accent-800"
              target="_blank"
            >
              Terms of Service
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-accent-700 font-medium underline underline-offset-2 hover:text-accent-800"
              target="_blank"
            >
              Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="text-xs text-error m-0">
            {errors.terms}
          </p>
        )}
      </div>

      <FormAlert message={error}>
        {emailTaken && (
          <span>
            <Link href={withNext("/login", rawNext)} className="font-semibold text-inherit underline">
              Log in instead
            </Link>{" "}
            or{" "}
            <Link
              href={withNext("/forgot-password", rawNext)}
              className="font-semibold text-inherit underline"
            >
              reset your password
            </Link>
            .
          </span>
        )}
      </FormAlert>

      <SubmitButton pending={pending} pendingLabel="Creating your account…">
        Create account
      </SubmitButton>

      <p className="text-sm text-neutral-700 m-0 text-center">
        Already have an account?{" "}
        <Link
          href={withNext("/login", rawNext)}
          className="text-accent-700 font-semibold hover:text-accent-800"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

/**
 * Shown right after registering. The backend signs the new account in and
 * emails a verification link; verifying isn't required to carry on, so this
 * says where the link went and lets the person continue.
 */
function AccountCreated({ email, destination }: { email: string; destination: string }) {
  const [resend, setResend] = React.useState<"idle" | "sending" | "sent" | "failed">("idle");
  const continueRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    continueRef.current?.focus();
  }, []);

  async function handleResend() {
    if (resend === "sending") return;
    setResend("sending");
    try {
      await resendVerification();
      setResend("sent");
    } catch {
      setResend("failed");
    }
  }

  return (
    <AuthStatus
      icon="mail"
      title="Your account is ready"
      actions={
        <>
          <LinkButton
            ref={continueRef}
            href={destination}
            variant="primary"
            className="min-h-12 text-[15px] w-full"
          >
            Continue
          </LinkButton>
          <button
            type="button"
            onClick={handleResend}
            disabled={resend === "sending" || resend === "sent"}
            className="min-h-11 text-sm font-medium text-accent-700 hover:text-accent-800 bg-transparent border-0 cursor-pointer disabled:cursor-default disabled:text-neutral-600"
          >
            {resend === "sending"
              ? "Sending…"
              : resend === "sent"
                ? "New link sent"
                : "Resend the verification email"}
          </button>
        </>
      }
    >
      <p className="m-0">
        We&apos;ve sent a verification link to{" "}
        <strong className="text-text break-all">{email}</strong>. Open it to
        confirm your email. The link works for 24 hours.
      </p>
      <p className="m-0 mt-2 text-sm text-neutral-600" aria-live="polite">
        {resend === "failed"
          ? "We couldn't send another link just now. You can try again from your account."
          : "You can keep going in the meantime."}
      </p>
    </AuthStatus>
  );
}
