"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Scene } from "@/components/illustrations/scene";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { ContactForm } from "@/components/contact/contact-form";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";

const QUICK_LINKS: { icon: IconName; title: string; body: string; href: string }[] = [
  {
    icon: "truck",
    title: "Track a delivery",
    body: "Follow a package from pickup to drop-off with your tracking ID.",
    href: "/logistics/track",
  },
  {
    icon: "plane",
    title: "Manage a trip",
    body: "Look up a booking, check your itinerary or find fare details.",
    href: "/travels",
  },
  {
    icon: "user",
    title: "Account & billing",
    body: "Sign in to see your orders, payments and saved details.",
    href: "/account",
  },
];

const FAQS = [
  {
    q: "Where's my delivery?",
    a: "Use your tracking ID on the track page to see live status — picked up, in transit, out for delivery or delivered.",
  },
  {
    q: "How do I change or cancel a flight booking?",
    a: "Sign in and open My trips in your account to see change and cancellation options for that booking.",
  },
  {
    q: "A rider or driver hasn't shown up yet.",
    a: "Send us the tracking ID or booking reference below and we'll chase it up with the rider directly.",
  },
  {
    q: "I was charged twice, or the wrong amount.",
    a: "Tell us the date and amount in the message below — we'll check your payment history and refund any error.",
  },
  {
    q: "Do you support business accounts?",
    a: "Yes — see Instanta for Business for team workspaces, approvals and consolidated billing.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = React.useState<string | null>(FAQS[0].q);

  return (
    <div className="flex flex-col divide-y divide-divider border-t border-b border-divider">
      {FAQS.map((f) => {
        const isOpen = open === f.q;
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : f.q)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-5 text-left bg-transparent border-0 cursor-pointer"
            >
              <span className="text-base font-semibold">{f.q}</span>
              <Icon
                name="down"
                size={18}
                className={cn(
                  "shrink-0 text-accent transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-neutral-700 leading-relaxed m-0 pb-5 max-w-2xl">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const { user } = useAuth();

  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <FadeInWhenVisible>
            <Tag variant="outline" className="mb-5">
              Help centre
            </Tag>
            <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05] max-w-xl">
              How can we help?
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg mt-3">
              Track a delivery, check a trip, or send us a message &mdash; no
              account needed.
            </p>
            <LinkButton
              href="#contact"
              variant="primary"
              className="text-base px-6 py-3 mt-6"
            >
              Message support
            </LinkButton>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
              <Scene variant="network" className="absolute inset-0" />
            </figure>
          </FadeInWhenVisible>
        </section>

        {/* Quick links */}
        <section className="ins-container pt-24">
          <SectionKicker>Get started</SectionKicker>
          <div className="grid gap-5 sm:grid-cols-3">
            {QUICK_LINKS.map((l, i) => (
              <FadeInWhenVisible key={l.title} delay={i * 0.06}>
                <Link
                  href={l.href}
                  className="group flex flex-col gap-3 rounded-lg border border-divider bg-card p-6 no-underline text-text h-full hover:border-accent hover:shadow-[0_8px_24px_-12px_rgba(17,24,39,0.12)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="flex items-center justify-center size-11 rounded-full bg-accent-100 text-accent-700">
                    <Icon name={l.icon} size={22} />
                  </span>
                  <div className="flex items-center gap-1.5 text-lg font-semibold">
                    {l.title}
                    <Icon
                      name="right"
                      size={16}
                      className="text-accent opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                    />
                  </div>
                  <p className="text-sm text-neutral-700 m-0">{l.body}</p>
                </Link>
              </FadeInWhenVisible>
            ))}
          </div>

          {user && (
            <FadeInWhenVisible delay={0.18}>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-divider bg-accent-100/40 px-6 py-4 flex-wrap">
                <p className="text-sm text-neutral-700 m-0">
                  Signed in as {user.firstName}. Check your existing support
                  tickets before sending a new message.
                </p>
                <LinkButton href="/account/support" variant="secondary">
                  View my tickets
                </LinkButton>
              </div>
            </FadeInWhenVisible>
          )}
        </section>

        {/* FAQ */}
        <section className="ins-container pt-24">
          <FadeInWhenVisible>
            <SectionKicker>Frequently asked</SectionKicker>
            <div className="max-w-3xl">
              <FaqAccordion />
            </div>
          </FadeInWhenVisible>
        </section>

        {/* Contact form */}
        <section id="contact" className="ins-container pt-24 pb-24">
          <FadeInWhenVisible>
            <div className="relative overflow-hidden rounded-lg border border-divider bg-card p-8 lg:p-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10">
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-[90px]"
                aria-hidden="true"
              />
              <div className="relative">
                <h2 className="text-[clamp(26px,2.8vw,36px)] leading-tight mb-2">
                  Still need a hand?
                </h2>
                <p className="text-sm text-neutral-700 m-0">
                  Send us the details &mdash; order or tracking ID helps &mdash; and we
                  reply within one business day.
                </p>
              </div>
              <div className="relative">
                <ContactForm
                  defaultTopic="SUPPORT"
                  allowTopicChange={false}
                  submitLabel="Send to support"
                />
              </div>
            </div>
          </FadeInWhenVisible>
        </section>
      </main>
      <Footer />
    </>
  );
}
