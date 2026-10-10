import { Suspense } from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1 flex">
        <AuthShell
          heading="Welcome back"
          blurb="Log in to track a delivery, manage a trip, or pick up right where you left off."
        >
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </AuthShell>
      </main>
      <Footer />
    </>
  );
}
