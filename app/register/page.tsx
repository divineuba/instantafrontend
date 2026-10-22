import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create one Instanta account for Logistics, Travels, Crypto and Love.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <AuthShell
      heading="One account for all of Instanta"
      blurb="Send packages, book flights, trade crypto and meet people, all from a single sign-in."
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
