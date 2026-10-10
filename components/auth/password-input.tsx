"use client";

import * as React from "react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <span className="absolute left-3 top-0 h-full flex items-center text-neutral-400 pointer-events-none">
        <Icon name="lock" size={16} />
      </span>
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pl-9 pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-neutral-500 hover:text-neutral-700 cursor-pointer"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        <Icon name={visible ? "eye-off" : "eye"} size={16} />
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["bg-error", "bg-warning", "bg-accent-500", "bg-success"];

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = scorePassword(password);
  if (!password) return null;
  const level = Math.max(score, 1);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-neutral-200",
              i < level && STRENGTH_COLORS[level - 1],
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-600 w-10 text-right">
        {STRENGTH_LABELS[level - 1]}
      </span>
    </div>
  );
}
