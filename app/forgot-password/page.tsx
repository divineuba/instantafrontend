import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1 flex">
        <AuthShell
          heading="It happens to everyone"
          blurb="We'll email you a secure link to get back into your account."
        >
          <ForgotPasswordForm />
        </AuthShell>
      </main>
      <Footer />
    </>
  );
}
