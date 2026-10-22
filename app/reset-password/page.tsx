import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your Instanta account.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <AuthShell
      heading="Choose a new password"
      blurb="Once it's saved, we sign you out everywhere else so only you are signed in."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
