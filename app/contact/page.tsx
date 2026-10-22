import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Scene } from "@/components/illustrations/scene";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { ContactForm } from "@/components/contact/contact-form";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";

const CHANNELS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "help",
    title: "Support",
    body: "Help with a delivery, trip, trade or your account. If you're signed in, a ticket from your account is the fastest way.",
  },
  {
    icon: "briefcase",
    title: "Sales",
    body: "Questions about a business workspace for your team.",
  },
  {
    icon: "megaphone",
    title: "Press",
    body: "Media enquiries, partnerships and interview requests.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header business="group" />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <FadeInWhenVisible>
            <Tag variant="outline" className="mb-5">
              Contact us
            </Tag>
            <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05] max-w-xl">
              Get in touch.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg mt-3">
              Questions about an order, a business account, or something
              else entirely? Tell us below and we&apos;ll pass it to the
              right team.
            </p>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
              <Scene variant="growth" className="absolute inset-0" />
            </figure>
          </FadeInWhenVisible>
        </section>

        {/* Channels */}
        <section className="ins-container pt-24">
          <SectionKicker>Reach the right team</SectionKicker>
          <div className="grid gap-5 sm:grid-cols-3">
            {CHANNELS.map((c, i) => (
              <FadeInWhenVisible key={c.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3 rounded-lg border border-divider bg-card p-6 h-full transition-all duration-200 ">
                  <span className="flex items-center justify-center size-11 rounded-full bg-accent-100 text-accent-700" aria-hidden="true">
                    <Icon name={c.icon} size={22} />
                  </span>
                  <h2 className="text-lg font-semibold m-0 font-sans">{c.title}</h2>
                  <p className="text-sm text-neutral-700 m-0">{c.body}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* Offices + form */}
        <section className="ins-container pt-24 pb-24">
          <FadeInWhenVisible>
            <div className="relative overflow-hidden rounded-lg border border-divider bg-card p-8 lg:p-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10">
              <div
                className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-warm/10 blur-[90px]"
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-6">
                <div>
                  <h2 className="text-[clamp(26px,2.8vw,36px)] leading-tight mb-2">
                    Send us a message
                  </h2>
                  <p className="text-sm text-neutral-700 m-0">
                    We&apos;ll reply to the email address you give us.
                  </p>
                </div>
                <p className="text-sm text-neutral-700 m-0">
                  Need help with an order?{" "}
                  <Link href="/support" className="inline-flex min-h-11 items-center font-semibold text-accent-700 hover:text-accent-800">
                    Visit the support center
                  </Link>
                </p>
              </div>
              <div className="relative">
                <ContactForm defaultTopic="GENERAL" submitLabel="Send message" />
              </div>
            </div>
          </FadeInWhenVisible>
        </section>
      </main>
      <Footer />
    </>
  );
}
