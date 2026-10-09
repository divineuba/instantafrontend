"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

type TabKey = "deliver" | "fly" | "explore";

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: "deliver", label: "Deliver something", icon: "package" },
  { key: "fly", label: "Book a flight", icon: "plane" },
  { key: "explore", label: "Explore services", icon: "grid" },
];

const QUICK_LINKS: { label: string; icon: IconName; href: string }[] = [
  { label: "Send a package", icon: "package", href: "/logistics/book" },
  { label: "Track delivery", icon: "pin", href: "/logistics/track" },
  { label: "Same-day delivery", icon: "zap", href: "/logistics/services/same-day" },
  { label: "Book a flight", icon: "plane", href: "/travels" },
  { label: "Corporate travel", icon: "building", href: "/business" },
  { label: "Business account", icon: "briefcase", href: "/business" },
  { label: "All services", icon: "grid", href: "/services" },
];

export function ServiceSelector() {
  const [tab, setTab] = React.useState<TabKey>("deliver");

  return (
    <div className="rounded-lg border border-divider bg-card shadow-sm overflow-hidden">
      <div className="flex flex-wrap border-b border-divider">
        <div className="hidden lg:flex items-center px-6 py-4 border-r border-divider font-semibold text-[16px] w-[260px] shrink-0">
          What can we help you with?
        </div>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-4 border-r border-divider text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-accent text-white"
                : "text-text hover:bg-neutral-100",
            )}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "deliver" && (
        <div className="p-6 grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-end">
          <Field label="Pickup address">
            <Input placeholder="12 Admiralty Way, Lekki" />
          </Field>
          <Field label="Delivery address">
            <Input placeholder="Plot 5, Wuse II, Abuja" />
          </Field>
          <Field label="Package size">
            <Select>
              <option>Small · up to 5 kg</option>
              <option>Medium · up to 20 kg</option>
              <option>Large · up to 50 kg</option>
            </Select>
          </Field>
          <LinkButton href="/logistics/book" variant="primary" className="h-[38px]">
            Get a price <Icon name="arrow" size={14} />
          </LinkButton>
        </div>
      )}

      {tab === "fly" && (
        <div className="p-6 grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))_repeat(2,minmax(0,0.7fr))_auto] items-end">
          <Field label="From">
            <Input defaultValue="Lagos (LOS)" />
          </Field>
          <Field label="To">
            <Input defaultValue="London (LHR)" />
          </Field>
          <Field label="Departure">
            <Input defaultValue="12 Oct 2026" />
          </Field>
          <Field label="Passengers">
            <Input defaultValue="1 adult · Economy" />
          </Field>
          <LinkButton href="/travels/results" variant="primary" className="h-[38px]">
            Search flights <Icon name="arrow" size={14} />
          </LinkButton>
        </div>
      )}

      {tab === "explore" && (
        <div className="p-6 flex flex-wrap gap-2.5">
          {QUICK_LINKS.map((q) => (
            <LinkButton key={q.label} href={q.href} variant="secondary">
              <Icon name={q.icon} size={16} /> {q.label}
            </LinkButton>
          ))}
        </div>
      )}
    </div>
  );
}
