"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { trackDelivery, type Delivery, SPEEDS, WEIGHT_BANDS } from "@/lib/logistics";

const STAGE_DEFS: { key: "picked" | "transit" | "out" | "delivered"; label: string; icon: IconName }[] = [
  { key: "picked", label: "Picked up", icon: "package" },
  { key: "transit", label: "In transit", icon: "route" },
  { key: "out", label: "Out for delivery", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "check" },
];

const STAGE_ORDER = ["picked", "transit", "out", "delivered"] as const;

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDistanceLabel(weightBand?: string) {
  const band = WEIGHT_BANDS.find((b) => b.key === weightBand);
  return band?.label ?? "Up to 5 kg";
}

function TrackResult({ delivery }: { delivery: Delivery }) {
  const idx = STAGE_ORDER.indexOf(delivery.trackState as (typeof STAGE_ORDER)[number]);
  const speed = SPEEDS.find((s) => s.key === delivery.speed);

  const timeline = [
    delivery.trackState === "delivered" && {
      time: formatTime(delivery.eta),
      title: "Delivered",
      sub: `Confirmed with PIN by ${delivery.destinationContact}`,
    },
    idx >= 2 && {
      time: formatTime(delivery.eta),
      title: "Out for delivery",
      sub: `${delivery.riderName} is heading to the destination`,
    },
    idx >= 1 && {
      time: formatTime(delivery.createdAt),
      title: "In transit",
      sub: "Left the pickup hub",
    },
    idx >= 0 && {
      time: formatTime(delivery.createdAt),
      title: "Picked up",
      sub: `Signed by ${delivery.pickupContact}`,
    },
    {
      time: formatTime(delivery.createdAt),
      title: "Rider assigned",
      sub: `${delivery.riderName} · motorbike`,
    },
    {
      time: formatTime(delivery.createdAt),
      title: "Booked",
      sub: `${speed?.name ?? delivery.speed} · $${delivery.total}`,
    },
  ].filter(Boolean) as { time: string; title: string; sub: string }[];

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-divider mb-6 grid grid-cols-2 sm:grid-cols-4">
        {STAGE_DEFS.map((s, i) => {
          const done = i < idx || delivery.trackState === "delivered";
          const current = i === idx && delivery.trackState !== "delivered";
          return (
            <div
              key={s.key}
              className={`p-5 flex flex-col gap-2.5 border-r border-divider last:border-r-0 ${
                current ? "bg-accent-100/40" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`size-[26px] rounded-xl flex items-center justify-center border ${
                    done
                      ? "bg-accent border-accent text-white"
                      : current
                        ? "bg-white border-accent text-accent"
                        : "bg-transparent border-divider text-neutral-500"
                  }`}
                >
                  <Icon name={s.icon} size={14} />
                </span>
                <span
                  className={`text-xl font-semibold ${
                    i <= idx ? "text-text" : "text-neutral-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <span className="text-[13px] text-neutral-700">
                {i === idx && delivery.trackState !== "delivered"
                  ? `Est. ${formatTime(delivery.eta)}`
                  : i <= idx
                    ? formatTime(delivery.eta)
                    : "—"}
              </span>
              <span
                className={`h-[3px] ${done ? "bg-accent" : "bg-neutral-300"}`}
              />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
        <div
          className="relative rounded-xl border border-divider overflow-hidden h-[420px] sm:h-[520px]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-divider) 1px, transparent 1px), linear-gradient(90deg, var(--color-divider) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        >
          <svg viewBox="0 0 800 560" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0 380 L800 300" stroke="var(--color-neutral-300)" strokeWidth={18} fill="none" />
            <path d="M260 0 L320 560" stroke="var(--color-neutral-300)" strokeWidth={12} fill="none" />
            <path d="M560 0 L620 560" stroke="var(--color-neutral-300)" strokeWidth={10} fill="none" />
            <path d="M0 140 Q400 200 800 120" stroke="var(--color-neutral-300)" strokeWidth={8} fill="none" />
            <path d="M120 470 L290 350 L470 330 L590 300" stroke="var(--color-accent)" strokeWidth={4} fill="none" />
            <path
              d="M590 300 L610 190 L690 110"
              stroke="var(--color-accent)"
              strokeWidth={3}
              strokeDasharray="8 7"
              fill="none"
            />
          </svg>
          <div className="absolute left-[15%] top-[84%] -translate-x-1/2 -translate-y-1/2 size-[18px] border-2 border-accent-800 bg-[var(--color-bg)]" />
          <div className="absolute left-[calc(15%+14px)] top-[calc(84%-10px)] text-xs bg-[var(--color-bg)] px-1.5 py-0.5 border border-divider rounded-xl">
            Pickup
          </div>
          <div className="absolute left-[86%] top-[20%] -translate-x-1/2 -translate-y-1/2 size-5 bg-accent-800 text-white rounded-[10px] flex items-center justify-center">
            <Icon name="pin" size={12} />
          </div>
          <div className="absolute left-[calc(86%-140px)] top-[calc(20%-36px)] text-xs bg-[var(--color-bg)] px-1.5 py-0.5 border border-divider rounded-xl">
            Drop-off
          </div>
          <div className="absolute left-[73.7%] top-[53.6%] -translate-x-1/2 -translate-y-1/2 size-9 bg-accent text-white rounded-[10px] flex items-center justify-center shadow-[0_0_0_8px_rgba(113,75,103,0.22)]">
            <Icon name="truck" size={18} />
          </div>
          <div className="absolute left-5 top-5 bg-[var(--color-bg)] border border-divider px-3.5 py-2.5 flex gap-2.5 items-center text-[13px] rounded-xl">
            <span className="size-2 rounded-full bg-[#28a745]" />
            Live · updated moments ago
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-xl border border-divider bg-card flex flex-col gap-1">
            <span className="text-xs text-neutral-600">
              {delivery.trackState === "delivered" ? "Delivered at" : "Estimated arrival"}
            </span>
            <span className="text-[48px] sm:text-[64px] font-semibold leading-none text-accent-700">
              {formatTime(delivery.eta)}
            </span>
            <span className="text-sm text-neutral-700">
              {delivery.destinationAddress}
            </span>
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card flex gap-3.5 items-center">
            <span className="size-12 rounded-[10px] bg-accent-200 text-accent-800 flex items-center justify-center text-xl font-semibold">
              {delivery.riderName
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2) ?? "—"}
            </span>
            <div className="mr-auto">
              <div className="text-xl font-semibold">{delivery.riderName}</div>
              <div className="text-[13px] text-neutral-700">
                Motorbike · {delivery.riderPhone}
              </div>
            </div>
            <Button variant="secondary" size="icon" aria-label="Call rider">
              <Icon name="phone" size={16} />
            </Button>
            <Button variant="secondary" size="icon" aria-label="Message rider">
              <Icon name="chat" size={16} />
            </Button>
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card">
            <div className="text-xl font-semibold mb-3">Timeline</div>
            <div className="flex flex-col">
              {timeline.map((t, i) => (
                <div key={i} className="grid grid-cols-[52px_14px_minmax(0,1fr)] gap-2.5 text-[13px]">
                  <span className="text-neutral-600">{t.time}</span>
                  <span className="flex flex-col items-center">
                    <span
                      className={`size-[9px] mt-1 border border-accent ${
                        i === 0 ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <span className="flex-1 w-px bg-divider min-h-[22px]" />
                    )}
                  </span>
                  <div className="pb-3">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-neutral-700">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <div className="text-neutral-600">Package</div>
              <div>{delivery.package?.description} · {formatDistanceLabel(delivery.package?.weightBand)}</div>
            </div>
            <div>
              <div className="text-neutral-600">Option</div>
              <div>{speed?.name ?? delivery.speed}</div>
            </div>
            <div>
              <div className="text-neutral-600">Recipient</div>
              <div>{delivery.destinationContact}</div>
            </div>
            <div>
              <div className="text-neutral-600">Tracking ID</div>
              <div>{delivery.trackingId}</div>
            </div>
            <LinkButton href="/account/support" variant="secondary" className="col-span-2">
              <Icon name="help" size={14} /> Get help with this delivery
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}

function TrackNotFound({ id }: { id: string }) {
  return (
    <div className="p-16 rounded-xl border border-divider flex flex-col items-center gap-3.5 text-center">
      <Icon name="search" size={32} className="text-neutral-600" />
      <div className="text-2xl font-semibold">
        {id ? `We couldn't find ${id}` : "Enter a tracking ID to begin"}
      </div>
      <p className="text-[15px] text-neutral-700 max-w-md m-0">
        Check the ID in your SMS or email. Tracking IDs start with INS- followed
        by letters and numbers.
      </p>
      <div className="flex gap-2.5">
        <LinkButton href="/account/trips" variant="secondary">
          See my deliveries
        </LinkButton>
        <LinkButton href="/account/support" variant="ghost">
          Contact support
        </LinkButton>
      </div>
    </div>
  );
}

function TrackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") ?? "";

  const [inputId, setInputId] = React.useState(initialId);
  const [delivery, setDelivery] = React.useState<Delivery | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [searchedId, setSearchedId] = React.useState<string | null>(null);

  const lookup = React.useCallback(async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchedId(id);
    try {
      const d = await trackDelivery(id.trim());
      setDelivery(d);
    } catch {
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Triggering the initial lookup from a ?id= query param on mount is a
    // genuine sync-with-external-system (URL) effect, not derivable
    // render-time state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.replace(`/logistics/track?id=${encodeURIComponent(inputId)}`);
    lookup(inputId);
  }

  const headline = delivery
    ? {
        picked: "Picked up",
        transit: "In transit",
        out: "Out for delivery",
        delivered: "Delivered",
        notfound: "No match",
      }[delivery.trackState]
    : "Track a delivery";

  return (
    <main className="flex-1 ins-container pt-14 pb-24">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-6 mb-7"
      >
        <div className="mr-auto">
          <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2">
            Track a delivery
          </div>
          <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05]">{headline}</h1>
        </div>
        <Field label="Tracking ID" className="w-full sm:w-[260px] lg:w-[300px]">
          <Input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="INS-23892"
          />
        </Field>
        <Button type="submit" className="h-10" disabled={loading}>
          {loading ? "Tracking…" : "Track"}
        </Button>
      </form>

      {searchedId && !loading && delivery && <TrackResult delivery={delivery} />}
      {searchedId && !loading && !delivery && <TrackNotFound id={searchedId} />}
      {!searchedId && !loading && <TrackNotFound id="" />}
    </main>
  );
}

export default function LogisticsTrackPage() {
  return (
    <>
      <Header business="logistics" active="track" />
      <React.Suspense fallback={<main className="flex-1 ins-container pt-14 pb-24" />}>
        <TrackPageInner />
      </React.Suspense>
      <Footer />
    </>
  );
}
