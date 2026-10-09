import { Suspense } from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
