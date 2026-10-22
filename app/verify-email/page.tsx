import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailStatus } from "@/components/auth/verify-email-status";

export const metadata: Metadata = {
  title: "Confirm your email",
  description: "Confirm the email address on your Instanta account.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <AuthShell
      heading="Confirm your email"
      blurb="Confirming your email helps keep your account recoverable if you ever lose access."
    >
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthShell>
  );
}
