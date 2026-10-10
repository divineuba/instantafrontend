import { Suspense } from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1 flex">
        <AuthShell
          heading="One account, every Instanta business"
          blurb="Create an account to book deliveries, search flights, and manage everything from a single dashboard."
        >
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </AuthShell>
      </main>
      <Footer />
    </>
  );
}
