"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthCard, AuthStatus, describeAuthError } from "@/components/auth/auth-ui";
import { ApiError } from "@/lib/api";
import { resendVerification, verifyEmail } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

type State =
  | { kind: "verifying" }
  | { kind: "verified" }
  | { kind: "failed"; message: string; expired: boolean };

/**
 * Landing page for the link in the verification email
 * (`/verify-email?token=…`, sent by the backend's sendVerificationEmail).
 * It confirms the token once, then says what happened and what to do next.
 */
export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, refresh } = useAuth();
  const [state, setState] = React.useState<State>({ kind: "verifying" });
  const attempted = React.useRef<string | null>(null);

  React.useEffect(() => {
    // A token is single-use, so never send the same one twice (Strict Mode
    // runs effects twice in development).
    if (!token || attempted.current === token) return;
    attempted.current = token;
    verifyEmail({ token })
      .then(() => {
        setState({ kind: "verified" });
        // Clears the "verify your email" banner if this browser is signed in.
        void refresh();
      })
      .catch((err) => {
        setState({
          kind: "failed",
          message: describeAuthError(err),
          expired: err instanceof ApiError && err.status === 400,
        });
      });
  }, [token, refresh]);

  if (!token) {
    return (
      <AuthStatus
        icon="alert"
        tone="error"
        title="This verification link is incomplete"
        actions={<NextStepButton signedIn={!!user} />}
      >
        <p className="m-0">
          The link is missing part of its code. Open it straight from the
          email we sent you.
        </p>
      </AuthStatus>
    );
  }

  if (state.kind === "verifying") {
    return (
      <AuthCard className="items-center text-center">
        <div role="status" className="flex flex-col items-center gap-4 py-6">
          <Spinner size={28} className="text-accent" aria-hidden="true" role="presentation" aria-label={undefined} />
          <p className="m-0 text-[15px] text-neutral-700">Confirming your email…</p>
        </div>
      </AuthCard>
    );
  }

  if (state.kind === "verified") {
    return (
      <AuthStatus
        icon="check"
        tone="success"
        title="Email confirmed"
        actions={
          user ? (
            <LinkButton href="/account" variant="primary" className="min-h-12 text-[15px] w-full">
              Go to your account
            </LinkButton>
          ) : (
            <LinkButton href="/login" variant="primary" className="min-h-12 text-[15px] w-full">
              Log in
            </LinkButton>
          )
        }
      >
        <p className="m-0" role="status">
          Thanks. Your email address is verified.
        </p>
      </AuthStatus>
    );
  }

  return (
    <AuthStatus
      icon="alert"
      tone="error"
      title={state.expired ? "This link has expired" : "We couldn't confirm your email"}
      actions={
        user ? <ResendButton /> : <NextStepButton signedIn={false} />
      }
    >
      <p className="m-0" role="alert">
        {state.expired
          ? "Verification links work once, for 24 hours. "
          : `${state.message} `}
        {user
          ? "Send yourself a new link below."
          : "Log in and we'll let you send a new link from your account."}
      </p>
    </AuthStatus>
  );
}

function NextStepButton({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <LinkButton href="/account" variant="primary" className="min-h-12 text-[15px] w-full">
      Go to your account
    </LinkButton>
  ) : (
    <LinkButton
      href={`/login?next=${encodeURIComponent("/account")}`}
      variant="primary"
      className="min-h-12 text-[15px] w-full"
    >
      Log in
    </LinkButton>
  );
}

function ResendButton() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (status !== "idle") return;
    setStatus("sending");
    setError(null);
    try {
      await resendVerification();
      setStatus("sent");
    } catch (err) {
      setError(describeAuthError(err));
      setStatus("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={status !== "idle"}
        aria-busy={status === "sending" || undefined}
        className="min-h-12 w-full inline-flex items-center justify-center gap-2 rounded-[0.4rem] bg-accent text-white font-semibold text-[15px] border-0 cursor-pointer hover:bg-accent-700 disabled:cursor-default disabled:opacity-80"
      >
        {status === "sending" && <Spinner size={16} aria-hidden="true" role="presentation" aria-label={undefined} />}
        {status === "sent" ? "New link sent. Check your inbox" : status === "sending" ? "Sending…" : "Send a new link"}
      </button>
      <p className="m-0 text-sm text-error min-h-5" aria-live="polite">
        {error}
      </p>
    </>
  );
}
