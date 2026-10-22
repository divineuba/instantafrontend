import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { DELETION_DELETED, DELETION_KEPT } from "@/lib/account-deletion";

export const metadata: Metadata = {
  title: "Delete your account",
  description: "How to ask Instanta to delete your account and personal data, and what we keep.",
  robots: { index: true, follow: true },
};

/** Public, signed-out explanation of account deletion (Google Play asks for
 * a web page that works without the app). The request itself is filed from
 * /account/delete once signed in. */
export default function DeleteAccountInfoPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        <section className="ins-container pt-16 pb-24 max-w-3xl flex flex-col gap-8">
          <div>
            <Tag variant="outline" className="mb-5">
              Account
            </Tag>
            <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05]">Delete your Instanta account</h1>
            <p className="text-base text-neutral-700 mt-4 m-0">
              You can ask us to delete your account from the website, without the app. Sign in, then send a deletion
              request. Our support team will contact you at your account email before deleting anything, including
              about crypto, deliveries or trips that are still open.
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <LinkButton href={`/login?next=${encodeURIComponent("/account/delete")}`} variant="primary">
              Sign in to request deletion
            </LinkButton>
            <LinkButton href="/account/delete" variant="secondary">
              I&apos;m already signed in
            </LinkButton>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-divider bg-card">
              <h2 className="text-xl font-semibold mb-2">What we delete</h2>
              <ul className="text-sm text-neutral-700 m-0 pl-5 flex flex-col gap-1.5">
                {DELETION_DELETED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-divider bg-card">
              <h2 className="text-xl font-semibold mb-2">What we keep</h2>
              <ul className="text-sm text-neutral-700 m-0 pl-5 flex flex-col gap-1.5">
                {DELETION_KEPT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-neutral-600 m-0">
            Can&apos;t sign in? <Link href="/forgot-password">Reset your password</Link> first, or{" "}
            <Link href="/contact">contact us</Link>. See our <Link href="/privacy">privacy policy</Link> for how long records
            are kept.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
