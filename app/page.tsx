import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { buttonVariants } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { businesses } from "@/lib/businesses.config";
import { cn } from "@/lib/cn";

/**
 * What each service actually does today. Every line here maps to a feature
 * in the product (see the backend modules named in the comments), so keep
 * it that way when editing: no claims the code can't back up.
 */
const SERVICE_DETAIL: Record<string, { summary: string; features: string[] }> = {
  // delivery: quote endpoint, live tracking gateway, delivery messages
  logistics: {
    summary: "Send a package across town and follow it to the door.",
    features: [
      "See the price before you book",
      "Follow your rider live on a map",
      "Message your rider from the app",
    ],
  },
  // flights + bookings: search, PRICE_CHANGED check, trips in account
  travels: {
    summary: "Search flights, compare fares and book in a few steps.",
    features: [
      "Compare flights side by side",
      "Fare checked again before you pay",
      "Every trip saved in your account",
    ],
  },
  // crypto: six assets, market pricing, NGN rate for cash-out
  crypto: {
    summary: "Buy, sell and swap major coins, and cash out in Naira.",
    features: [
      "Bitcoin, Ethereum, USDT, USDC, BNB and Solana",
      "Prices from the live market",
      "Send and receive with your own wallet address",
    ],
  },
  // dating: matches gate chat, block + report
  love: {
    summary: "Meet new people and talk once the interest is mutual.",
    features: [
      "Chat opens only when you both match",
      "Block or report anyone, any time",
      "Discover profiles, then like or pass",
    ],
  },
};

const TRUST: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "grid",
    title: "One sign-in for everything",
    body: "The same email and password open Logistics, Travels, Crypto and Love. One profile, one place to manage it.",
  },
  {
    icon: "tag",
    title: "Prices before you commit",
    body: "Deliveries are quoted before you book. Flight fares are checked again at payment, and if a fare moved we ask before charging.",
  },
  {
    icon: "lock",
    title: "Your account stays yours",
    body: "Sessions live in secure cookies, and resetting your password signs you out of every other device.",
  },
  {
    icon: "chat",
    title: "Help from inside your account",
    body: "Open a support ticket from your account and keep the whole conversation in one thread.",
  },
];

export default function Home() {
  return (
    <>
      <Header business="group" />
      <main id="main" className="flex-1">
        {/* 1. What Instanta is */}
        <section
          aria-labelledby="hero-title"
          className="ins-container pt-10 sm:pt-16 lg:pt-20 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center"
        >
          <div className="flex flex-col gap-6">
            <p className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-accent-100 px-3 py-1.5 text-[13px] font-semibold text-accent-800">
              <span className="flex -space-x-1" aria-hidden="true">
                {businesses.map((b) => (
                  <span
                    key={b.id}
                    className={cn("size-2.5 rounded-full ring-2 ring-accent-100 bg-space", `space-${b.id}`)}
                  />
                ))}
              </span>
              One account, four services
            </p>
            <h1
              id="hero-title"
              className="m-0 text-[clamp(36px,6.4vw,68px)] leading-[1.04] tracking-tight text-neutral-900"
            >
              Deliveries, flights, crypto and dates.{" "}
              <span className="font-script text-accent font-normal text-[1.12em] leading-none">
                All in one place.
              </span>
            </h1>
            <p className="m-0 text-lg leading-relaxed max-w-xl text-neutral-700">
              Instanta brings Logistics, Travels, Crypto and Love together
              behind a single sign-in, built for everyday life in Nigeria.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "primary" }), "min-h-12 px-6 text-base")}
              >
                Create your account
                <Icon name="arrow" size={16} aria-hidden="true" />
              </Link>
              <p className="m-0 text-[15px] text-neutral-700">
                Already with us?{" "}
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center font-semibold text-accent-700 hover:text-accent-800"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <HeroTiles />
        </section>

        {/* 2. The four services */}
        <section aria-labelledby="services-title" className="ins-container pt-24 sm:pt-28">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <SectionKicker>The services</SectionKicker>
              <h2
                id="services-title"
                className="m-0 text-[clamp(28px,3.6vw,44px)] leading-tight max-w-xl"
              >
                Four services. One sign-in.
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-accent-700 hover:text-accent-800"
            >
              Browse every service <Icon name="arrow" size={14} aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid md:grid-cols-2 gap-5 m-0 p-0 list-none">
            {businesses.map((b) => {
              const detail = SERVICE_DETAIL[b.id];
              return (
                <li key={b.id} className={`space-${b.id}`}>
                    <article className="h-full rounded-2xl border border-divider bg-card overflow-hidden flex flex-col">
                      <div className="relative h-2 bg-space" aria-hidden="true" />
                      <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid place-items-center size-11 rounded-xl bg-space-soft text-space-ink"
                            aria-hidden="true"
                          >
                            <Icon name={b.icon} size={22} />
                          </span>
                          <div>
                            <h3 className="m-0 text-[22px] leading-tight">
                              {b.label.replace("Instanta ", "")}
                            </h3>
                            <p className="m-0 text-sm text-space-ink font-medium">{b.tagline}</p>
                          </div>
                        </div>
                        <p className="m-0 text-[15px] text-neutral-700">{detail?.summary}</p>
                        <ul className="m-0 p-0 list-none flex flex-col gap-2">
                          {detail?.features.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-[15px] text-neutral-800">
                              <Icon
                                name="check"
                                size={16}
                                className="text-space shrink-0 mt-[3px]"
                                aria-hidden="true"
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <Link
                            href={b.cta.href}
                            className={cn(
                              buttonVariants({ variant: "primary" }),
                              "min-h-11 bg-space border-space hover:bg-space-ink hover:border-space-ink",
                            )}
                          >
                            {b.cta.label}
                          </Link>
                          <Link
                            href={b.href}
                            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-space-ink hover:underline underline-offset-4"
                          >
                            About {b.label.replace("Instanta ", "")}
                            <Icon name="arrow" size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3. Why trust it */}
        <section aria-labelledby="trust-title" className="ins-container pt-24 sm:pt-28">
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16">
            <div>
              <SectionKicker>Why Instanta</SectionKicker>
              <h2 id="trust-title" className="m-0 text-[clamp(28px,3.6vw,44px)] leading-tight">
                Built so you always know where you stand.
              </h2>
              <p className="mt-4 mb-0 text-[15px] text-neutral-700 max-w-md">
                No fine print in these: each one is how the product works
                today.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-9 m-0 p-0 list-none">
              {TRUST.map((t) => (
                <li key={t.title} className="flex flex-col gap-2.5">
                  <span
                    className="grid place-items-center size-10 rounded-xl bg-accent-100 text-accent-700"
                    aria-hidden="true"
                  >
                    <Icon name={t.icon} size={19} />
                  </span>
                  <h3 className="m-0 text-lg">{t.title}</h3>
                  <p className="m-0 text-[15px] text-neutral-700 leading-relaxed">{t.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Business, kept short */}
        <section aria-labelledby="biz-title" className="ins-container pt-24 sm:pt-28">
          <div className="rounded-2xl border border-divider bg-neutral-100/60 p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
            <span
              className="grid place-items-center size-12 rounded-xl bg-white text-accent-700 border border-divider shrink-0"
              aria-hidden="true"
            >
              <Icon name="briefcase" size={22} />
            </span>
            <div className="flex-1">
              <h2 id="biz-title" className="m-0 text-[22px] leading-tight">
                Running a team?
              </h2>
              <p className="mt-1.5 mb-0 text-[15px] text-neutral-700 max-w-2xl">
                Business workspaces add team roles, monthly spending limits,
                approvals and invoices on top of your Instanta account.
              </p>
            </div>
            <Link
              href="/business"
              className={cn(buttonVariants({ variant: "secondary" }), "min-h-11 self-start md:self-auto")}
            >
              Instanta for Business
            </Link>
          </div>
        </section>

        {/* 4. One clear call to action */}
        <section aria-labelledby="cta-title" className="ins-container pt-24 sm:pt-28">
          <div className="relative overflow-hidden rounded-3xl bg-accent-900 text-white px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-accent/40 blur-[100px]"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 id="cta-title" className="m-0 text-[clamp(28px,4vw,46px)] leading-tight max-w-2xl">
                One account. Everything Instanta.
              </h2>
              <p className="m-0 text-[17px] text-accent-200 max-w-lg">
                Sign up once and the same account works for deliveries,
                flights, crypto and dating.
              </p>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "inverse" }), "min-h-12 px-7 text-base mt-1")}
              >
                Create your account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** Decorative: the four services as a loose stack of tiles. */
function HeroTiles() {
  return (
    <div aria-hidden="true" className="relative isolate">
      <div
        className="absolute inset-6 -z-10 rounded-[2.5rem] bg-accent-100 rotate-[-3deg] motion-reduce:rotate-0"
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[520px] mx-auto lg:mx-0 lg:ml-auto">
        {businesses.map((b, i) => (
          <div
            key={b.id}
            className={cn(
              "rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-6 sm:gap-10 min-h-[132px] sm:min-h-[176px] text-white bg-space shadow-[0_18px_40px_-24px_rgba(17,24,39,0.55)]",
              `space-${b.id}`,
              i % 2 === 0 && "lg:translate-y-6",
            )}
          >
            <span className="grid place-items-center size-10 sm:size-12 rounded-xl bg-white/15 ring-1 ring-white/25">
              <Icon name={b.icon} size={22} />
            </span>
            <span>
              <span className="block text-[17px] sm:text-xl font-semibold font-heading leading-tight">
                {b.label.replace("Instanta ", "")}
              </span>
              <span className="block text-[13px] sm:text-sm text-white/85 leading-snug mt-1">
                {b.tagline}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
