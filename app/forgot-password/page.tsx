import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Get a link to reset your Instanta password.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <AuthShell
      heading="Locked out? It happens."
      blurb="We'll email you a link to choose a new password. It works for one hour."
    >
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
