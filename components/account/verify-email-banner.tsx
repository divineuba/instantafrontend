"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { resendVerification } from "@/lib/auth";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  if (dismissed) return null;

  async function handleResend() {
    setSending(true);
    try {
      await resendVerification();
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#fff8e1] border-b border-[#f0dca0] text-sm text-[#7a5a05]">
      <Icon name="mail" size={16} className="shrink-0" />
      <span className="flex-1 min-w-0">
        {sent ? (
          <>Verification link sent to <strong>{email}</strong>. Check your inbox.</>
        ) : (
          <>Please verify <strong>{email}</strong> to secure your account.</>
        )}
      </span>
      {!sent && (
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="font-semibold underline bg-transparent border-0 p-0 cursor-pointer text-inherit disabled:opacity-60"
        >
          {sending ? "Sending…" : "Resend email"}
        </button>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 bg-transparent border-0 p-0.5 cursor-pointer text-inherit opacity-70 hover:opacity-100"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
