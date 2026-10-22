"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

/** The card every auth form and status message sits in. On phones it drops
 * the border and padding so the form uses the full width. */
export const AUTH_CARD_CLASS =
  "w-full max-w-[440px] flex flex-col gap-5 rounded-2xl bg-card sm:border sm:border-divider sm:p-9 sm:shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_40px_-20px_rgba(17,24,39,0.16)]";

export function AuthCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(AUTH_CARD_CLASS, className)}>{children}</div>;
}

export function AuthHeading({
  title,
  children,
  id,
}: {
  title: string;
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 id={id} className="text-[28px] leading-tight tracking-tight m-0">
        {title}
      </h1>
      {children && <p className="text-[15px] text-neutral-700 m-0">{children}</p>}
    </div>
  );
}

/** Centered status card: an icon, a heading and what to do next. */
export function AuthStatus({
  icon,
  tone = "accent",
  title,
  children,
  actions,
}: {
  icon: IconName;
  tone?: "accent" | "error" | "success";
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <AuthCard className="text-center items-center">
      <span
        className={cn(
          "flex items-center justify-center size-14 rounded-full",
          tone === "accent" && "bg-accent-100 text-accent-700",
          tone === "error" && "bg-[#fbe7e9] text-[#a71d2a]",
          tone === "success" && "bg-[#e9f6ec] text-[#1e7e34]",
        )}
        aria-hidden="true"
      >
        <Icon name={icon} size={26} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] leading-tight tracking-tight m-0">{title}</h1>
        {children && (
          <div className="text-[15px] text-neutral-700 leading-relaxed">{children}</div>
        )}
      </div>
      {actions && <div className="w-full flex flex-col gap-3 pt-1">{actions}</div>}
    </AuthCard>
  );
}

/**
 * Server and network errors for a form. The live region is always in the
 * DOM, so screen readers announce the message as soon as it appears rather
 * than only when focus happens to land on it.
 */
export function FormAlert({
  message,
  children,
}: {
  message: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div role="alert" aria-live="assertive" aria-atomic="true">
      {message && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#a71d2a]/25 bg-[#fbe7e9] px-3.5 py-3 text-sm text-[#8f1b26]">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex flex-col gap-1.5">
            <span>{message}</span>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/** Full-width submit button that shows progress while the request runs. */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
  disabled,
  className,
}: {
  pending: boolean;
  pendingLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      block
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={cn("min-h-12 text-[15px] disabled:opacity-80", className)}
    >
      {pending ? (
        <>
          <Spinner size={16} aria-hidden="true" role="presentation" aria-label={undefined} />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * Guards an async submit handler against running twice: a fast double
 * click (or Enter held down) can fire submit again before React re-renders
 * the disabled button, so a ref, not state, is the source of truth.
 */
export function useSubmitGuard() {
  const inFlight = React.useRef(false);
  const [pending, setPending] = React.useState(false);

  const run = React.useCallback(async (fn: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    try {
      await fn();
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, []);

  return { pending, run };
}

/** A readable message for a failed auth request. Keeps the server's own
 * wording where it is meant for people (e.g. "Invalid email or password"). */
export function describeAuthError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "Too many attempts. Please wait a minute, then try again.";
    }
    if (err.status >= 500) {
      return "Something went wrong on our side. Please try again in a moment.";
    }
    const message = Array.isArray((err.body as { message?: unknown })?.message)
      ? ((err.body as { message: string[] }).message[0] ?? err.message)
      : err.message;
    return message;
  }
  if (err instanceof TypeError) {
    return "We couldn't reach Instanta. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

/** Moves focus to the first field with an error after a failed submit. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  const el = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
  el?.focus();
}
