"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { SectionKicker } from "@/components/ui/section-kicker";

interface ServiceItem {
  name: string;
  icon: IconName;
  desc: string;
  href: string;
  available: boolean;
}

interface ServiceGroup {
  key: "logistics" | "travels" | "soon";
  name: string;
  icon: IconName;
  desc: string;
  href: string;
  cta: string;
  items: ServiceItem[];
}

const GROUPS: ServiceGroup[] = [
  {
    key: "logistics",
    name: "Logistics",
    icon: "truck",
    desc: "Pickup, delivery and tracking for individuals and businesses.",
    href: "/logistics",
    cta: "Explore Logistics",
    items: [
      { name: "Personal delivery", icon: "package", desc: "Send parcels across the city or the country.", href: "/logistics/services/personal", available: true },
      { name: "Same-day delivery", icon: "zap", desc: "Picked up within the hour, delivered today.", href: "/logistics/services/same-day", available: true },
      { name: "Business delivery", icon: "briefcase", desc: "Recurring deliveries for shops and SMEs.", href: "/logistics/services/business", available: true },
      { name: "Scheduled delivery", icon: "calendar", desc: "Book a pickup slot days ahead.", href: "/logistics/services/scheduled", available: true },
      { name: "Bulk delivery", icon: "layers", desc: "Many drop-offs from one upload.", href: "/logistics/services/bulk", available: true },
      { name: "Package tracking", icon: "pin", desc: "Live status, rider and ETA.", href: "/logistics/track", available: true },
    ],
  },
  {
    key: "travels",
    name: "Travels",
    icon: "plane",
    desc: "Flight booking and travel support for every kind of trip.",
    href: "/travels",
    cta: "Explore Travels",
    items: [
      { name: "Flight booking", icon: "plane", desc: "Compare fares across airlines and book.", href: "/travels", available: true },
      { name: "Corporate travel", icon: "building", desc: "Policies, approvals and central billing.", href: "/business", available: true },
      { name: "Travel assistance", icon: "help", desc: "Changes, refunds and trip support.", href: "/account/support", available: true },
      { name: "Ticketing", icon: "file", desc: "E-tickets and itineraries in your account.", href: "/account/trips", available: true },
      { name: "Visa support", icon: "globe", desc: "Document checklists and appointment help.", href: "/services", available: false },
    ],
  },
  {
    key: "soon",
    name: "Coming soon",
    icon: "plus",
    desc: "New Instanta businesses plug into the same account.",
    href: "/services",
    cta: "Get notified",
    items: [
      { name: "Payments", icon: "wallet", desc: "Send money and pay bills.", href: "/services", available: false },
      { name: "Hotels", icon: "bed", desc: "Stays to go with your flights.", href: "/services", available: false },
      { name: "Car rentals", icon: "car", desc: "Self-drive and chauffeur hire.", href: "/services", available: false },
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
    soon: GROUPS.find((g) => g.key === "soon")!.items.length,
  };

  return (
    <>
      <Header business="group" />
      <main className="flex-1 ins-container pt-14">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-end pb-8 border-b border-divider">
          <div>
            <SectionKicker>Services directory</SectionKicker>
            <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05]">
              Everything Instanta does, in one place.
            </h1>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <Icon name="search" size={16} />
            </span>
            <input
              className="w-full h-[42px] pl-9 pr-3 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]"
              placeholder="Search services — e.g. same-day, visa, bulk"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 py-5 flex-wrap">
          <Segmented
            name="service-filter"
            value={filter}
            onChange={(v) => setFilter(v as FilterKey)}
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "logistics", label: `Logistics (${counts.logistics})` },
              { value: "travels", label: `Travels (${counts.travels})` },
              { value: "soon", label: `Coming soon (${counts.soon})` },
            ]}
          />
          <span className="text-[13px] text-neutral-600 ml-auto">
            {shownCount} service{shownCount === 1 ? "" : "s"}
          </span>
        </div>

        {visibleGroups.length === 0 && (
          <div className="py-24 text-center text-neutral-600 border-t border-divider">
            No services match &ldquo;{query}&rdquo;. Try a different search.
          </div>
        )}

        {visibleGroups.map((g) => (
          <section
            key={g.key}
            className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-8 py-8 border-t border-divider"
          >
            <div className="flex flex-col gap-2.5">
              <Icon name={g.icon} size={28} className="text-accent" />
              <h2 className="text-2xl">{g.name}</h2>
              <p className="text-sm text-neutral-700 m-0">{g.desc}</p>
              <LinkButton href={g.href} variant="ghost" className="self-start pl-0">
                {g.cta} <Icon name="arrow" size={14} />
              </LinkButton>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {g.items.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  className={`p-5 flex flex-col gap-2.5 rounded-lg border bg-card text-text no-underline hover:border-accent-300 hover:bg-accent-100/40 transition-colors ${
                    s.available ? "border-divider" : "border-dashed border-divider"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <Icon name={s.icon} size={20} className="text-accent-700" />
                    <Tag variant={s.available ? "accent" : "neutral"}>
                      {s.available ? "Available" : "Coming soon"}
                    </Tag>
                  </div>
                  <div className="font-semibold text-[18px]">{s.name}</div>
                  <p className="text-sm text-neutral-700 m-0 flex-1">{s.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
