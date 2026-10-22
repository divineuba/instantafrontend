"use client";

import * as React from "react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Password field with a show/hide toggle and a Caps Lock warning.
 *
 * The toggle is a real, focusable button (keyboard users need it as much as
 * anyone) with aria-pressed, and it never submits the form. Showing the
 * password doesn't change autocomplete, so password managers keep working.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, id, onKeyUp, onKeyDown, onBlur, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [capsLock, setCapsLock] = React.useState(false);
  const capsId = id ? `${id}-caps` : undefined;

  function trackCapsLock(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === "function") {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  }

  return (
    <>
      <div className="relative">
        <span
          className="absolute left-3 top-0 h-full flex items-center text-neutral-500 pointer-events-none"
          aria-hidden="true"
        >
          <Icon name="lock" size={16} />
        </span>
        <Input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn("min-h-11 pl-9 pr-12 text-[15px]", className)}
          onKeyUp={(e) => {
            trackCapsLock(e);
            onKeyUp?.(e);
          }}
          onKeyDown={(e) => {
            trackCapsLock(e);
            onKeyDown?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-md text-neutral-600 hover:text-neutral-900 cursor-pointer bg-transparent border-0"
          aria-label="Show password"
          aria-pressed={visible}
          aria-controls={id}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={18} />
        </button>
      </div>
      <p
        id={capsId}
        aria-live="polite"
        className={cn(
          "m-0 text-xs text-[#8a5a00] items-center gap-1.5",
          capsLock ? "flex" : "hidden",
        )}
      >
        <Icon name="alert" size={13} aria-hidden="true" />
        {capsLock ? "Caps Lock is on" : ""}
      </p>
    </>
  );
});
PasswordInput.displayName = "PasswordInput";

/** The server's only password rule (RegisterDto / ResetPasswordDto). */
export const PASSWORD_MIN_LENGTH = 8;

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["bg-error", "bg-[#d18a00]", "bg-accent-500", "bg-success"];

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

/**
 * Live feedback while choosing a password: the one hard rule (length,
 * mirrored from the server) as a checklist item, plus an advisory strength
 * bar. Only the length rule ever blocks submission.
 */
export function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const longEnough = password.length >= PASSWORD_MIN_LENGTH;
  const score = scorePassword(password);
  const level = Math.max(score, 1);

  return (
    <div id={id} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2" aria-hidden={!password}>
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-neutral-200 transition-colors",
                password && i < level && STRENGTH_COLORS[level - 1],
              )}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-700 w-12 text-right">
          {password ? STRENGTH_LABELS[level - 1] : ""}
        </span>
      </div>
      <p
        className={cn(
          "m-0 text-xs flex items-center gap-1.5",
          longEnough ? "text-[#1e7e34]" : "text-neutral-700",
        )}
      >
        <Icon name={longEnough ? "check" : "info"} size={13} aria-hidden="true" />
        At least {PASSWORD_MIN_LENGTH} characters
        <span className="sr-only">{longEnough ? " (met)" : " (not met yet)"}</span>
      </p>
    </div>
  );
}
