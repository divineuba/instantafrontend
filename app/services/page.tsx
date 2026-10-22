"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Icon, type IconName } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { SectionKicker } from "@/components/ui/section-kicker";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";
import { cn } from "@/lib/cn";

interface ServiceItem {
  name: string;
  icon: IconName;
  desc: string;
  href: string;
}

interface ServiceGroup {
  key: "logistics" | "travels" | "crypto" | "love";
  name: string;
  icon: IconName;
  desc: string;
  href: string;
  cta: string;
  items: ServiceItem[];
}

// Every item links to a working page. Add a service here only once its
// page exists.
const GROUPS: ServiceGroup[] = [
  {
    key: "logistics",
    name: "Logistics",
    icon: "truck",
    desc: "Pickup, delivery and live tracking for individuals and businesses.",
    href: "/logistics",
    cta: "About Logistics",
    items: [
      { name: "Personal delivery", icon: "package", desc: "Send a parcel to someone across town.", href: "/logistics/services/personal" },
      { name: "Same-day delivery", icon: "zap", desc: "Picked up and delivered the same day.", href: "/logistics/services/same-day" },
      { name: "Business delivery", icon: "briefcase", desc: "Regular deliveries for shops and small businesses.", href: "/logistics/services/business" },
      { name: "Scheduled delivery", icon: "calendar", desc: "Book a pickup for a later date and time.", href: "/logistics/services/scheduled" },
      { name: "Bulk delivery", icon: "layers", desc: "Many drop-offs in one go.", href: "/logistics/services/bulk" },
      { name: "Corporate logistics", icon: "building", desc: "Deliveries billed to your company workspace.", href: "/logistics/services/corporate" },
      { name: "Package tracking", icon: "pin", desc: "Live status and your rider on a map.", href: "/logistics/track" },
    ],
  },
  {
    key: "travels",
    name: "Travels",
    icon: "plane",
    desc: "Flight search and booking, with your trips kept in your account.",
    href: "/travels",
    cta: "Search flights",
    items: [
      { name: "Flight booking", icon: "plane", desc: "Compare fares and book your seat.", href: "/travels" },
      { name: "Your trips", icon: "file", desc: "Bookings and itineraries in your account.", href: "/account/trips" },
      { name: "Corporate travel", icon: "building", desc: "Staff trips on a business workspace.", href: "/business" },
      { name: "Travel assistance", icon: "help", desc: "Get help with a booking from support.", href: "/support" },
    ],
  },
  {
    key: "crypto",
    name: "Crypto",
    icon: "bitcoin",
    desc: "Buy, sell, swap and send major coins, priced from the live market.",
    href: "/crypto",
    cta: "About Crypto",
    items: [
      { name: "Buy and sell", icon: "chart", desc: "Trade Bitcoin, Ethereum, stablecoins and more.", href: "/crypto/exchange" },
      { name: "Swap", icon: "swap", desc: "Exchange one coin for another.", href: "/crypto/exchange?tab=swap" },
      { name: "Send crypto", icon: "share", desc: "Send coins to another wallet address.", href: "/crypto/send" },
      { name: "Receive crypto", icon: "download", desc: "Get your deposit address for each coin.", href: "/crypto/receive" },
    ],
  },
  {
    key: "love",
    name: "Love",
    icon: "heart",
    desc: "Meet new people, and chat once you both match.",
    href: "/love",
    cta: "About Love",
    items: [
      { name: "Discover", icon: "users", desc: "Browse profiles, then like or pass.", href: "/love/discover" },
      { name: "Matches and chat", icon: "chat", desc: "Talk with the people you matched with.", href: "/love/matches" },
    ],
  },
];

type FilterKey = "all" | ServiceGroup["key"];

export default function ServicesPage() {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const q = query.trim().toLowerCase();

  const visibleGroups = GROUPS.filter((g) => filter === "all" || g.key === filter)
    .map((g) => ({
      ...g,
      items: q
        ? g.items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q),
          )
        : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const shownCount = visibleGroups.reduce((a, g) => a + g.items.length, 0);

  const counts = {
    all: GROUPS.reduce((a, g) => a + g.items.length, 0),
    logistics: GROUPS.find((g) => g.key === "logistics")!.items.length,
    travels: GROUPS.find((g) => g.key === "travels")!.items.length,
    crypto: GROUPS.find((g) => g.key === "crypto")!.items.length,
    love: GROUPS.find((g) => g.key === "love")!.items.length,
  };

  return (
    <>
      <Header business="group" />
      <main id="main" className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-32 right-[8%] w-96 h-96 rounded-full bg-accent/10 blur-[110px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-10 left-[4%] w-72 h-72 rounded-full bg-warm/10 blur-[100px]"
            aria-hidden="true"
          />
          <div className="ins-container relative pt-16">
            <FadeInWhenVisible>
              <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-end pb-8 border-b border-divider">
                <div>
                  <SectionKicker>Services directory</SectionKicker>
                  <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05]">
                    Everything Instanta does, in one place.
                  </h1>
                  <p className="text-lg text-neutral-700 max-w-lg mt-3">
                    {counts.all} things you can do with one Instanta account,
                    across Logistics, Travels, Crypto and Love.
                  </p>
                </div>
                <div className="relative">
                  <label htmlFor="service-search" className="sr-only">
                    Search services
                  </label>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" aria-hidden="true">
                    <Icon name="search" size={16} />
                  </span>
                  <input
                    id="service-search"
                    type="search"
                    className="w-full h-[46px] pl-9 pr-3 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]"
                    placeholder="Search, e.g. same-day, swap, flights"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </FadeInWhenVisible>

            <div className="flex items-center gap-4 py-5 flex-wrap">
              <Segmented
                name="service-filter"
                value={filter}
                onChange={(v) => setFilter(v as FilterKey)}
                options={[
                  { value: "all", label: `All (${counts.all})` },
                  { value: "logistics", label: `Logistics (${counts.logistics})` },
                  { value: "travels", label: `Travels (${counts.travels})` },
                  { value: "crypto", label: `Crypto (${counts.crypto})` },
                  { value: "love", label: `Love (${counts.love})` },
                ]}
              />
              <span className="text-[13px] text-neutral-600 ml-auto" aria-live="polite">
                {shownCount} service{shownCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </section>
        <div className="ins-container pb-16">
          {visibleGroups.length === 0 && (
            <div className="py-24 text-center text-neutral-600 border-t border-divider">
              No services match &ldquo;{query}&rdquo;. Try a different search.
            </div>
          )}

          {visibleGroups.map((g, gi) => (
            <FadeInWhenVisible key={g.key} delay={gi * 0.05}>
              <section
                aria-labelledby={`group-${g.key}`}
                className={cn(
                  "grid md:grid-cols-[260px_minmax(0,1fr)] gap-8 py-8 border-t border-divider",
                  `space-${g.key}`,
                )}
              >
                <div className="flex flex-col gap-2.5">
                  <span className="flex items-center justify-center size-12 rounded-xl bg-space-soft text-space-ink" aria-hidden="true">
                    <Icon name={g.icon} size={24} />
                  </span>
                  <h2 id={`group-${g.key}`} className="text-2xl m-0">{g.name}</h2>
                  <p className="text-sm text-neutral-700 m-0">{g.desc}</p>
                  <Link
                    href={g.href}
                    className="self-start inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-space-ink no-underline hover:underline underline-offset-4"
                  >
                    {g.cta} <Icon name="arrow" size={14} aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {g.items.map((s) => (
                    <Link
                      key={s.name}
                      href={s.href}
                      className={cn(
                        "group p-5 flex flex-col gap-2.5 rounded-xl border border-divider bg-card text-text no-underline transition-[border-color,box-shadow,transform] duration-200 hover:border-space hover:shadow-[0_8px_24px_-12px_rgba(17,24,39,0.12)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <span className="flex items-center justify-center size-9 rounded-lg bg-space-soft text-space-ink" aria-hidden="true">
                        <Icon name={s.icon} size={18} />
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-[18px]">
                        {s.name}
                        <Icon
                          name="right"
                          size={14}
                          aria-hidden="true"
                          className="text-space opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </div>
                      <p className="text-sm text-neutral-700 m-0 flex-1">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </FadeInWhenVisible>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

