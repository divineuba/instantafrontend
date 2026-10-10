import { Suspense } from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1 flex">
        <AuthShell
          heading="Choose a new password"
          blurb="Pick something you haven't used before. We'll sign you out everywhere else for safety."
        >
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </AuthShell>
      </main>
      <Footer />
    </>
  );
}
