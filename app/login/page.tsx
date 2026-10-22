import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Instanta account.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <AuthShell
      heading="Welcome back"
      blurb="Track a delivery, manage a trip, check your wallet or pick up a conversation, right where you left off."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
