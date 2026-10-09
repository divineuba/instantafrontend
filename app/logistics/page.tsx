"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { Field, Input } from "@/components/ui/field";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import {
  SPEEDS,
  LOGISTICS_SERVICES,
  MOCK_DISTANCE_KM,
  fmtUsd,
  quoteDelivery,
  type WeightBandKey,
} from "@/lib/logistics";

const ANSWERS: { icon: IconName; q: string; title: string; body: string }[] = [
  { icon: "package", q: "What", title: "Documents to bulky boxes", body: "Anything up to 50 kg that is legal to send. Fragile handling on request." },
  { icon: "globe", q: "Where", title: "20+ cities, door to door", body: "Lagos, Abuja, Port Harcourt, Accra, Nairobi and growing." },
  { icon: "wallet", q: "How much", title: "From $6.50, fixed upfront", body: "Priced by distance, weight and speed. No surge pricing." },
  { icon: "pin", q: "Tracking", title: "Live on the map", body: "Rider location and ETA from pickup to the recipient's PIN." },
];

const SIZE_OPTIONS: { value: WeightBandKey; label: string }[] = [
  { value: "UP_TO_5KG", label: "Small" },
  { value: "FROM_5_TO_20KG", label: "Medium" },
  { value: "FROM_20_TO_50KG", label: "Large" },
];

function QuickQuote() {
  const [pickup, setPickup] = React.useState("12 Admiralty Way, Lekki, Lagos");
  const [dropoff, setDropoff] = React.useState("24 Awolowo Rd, Ikoyi, Lagos");
  const [size, setSize] = React.useState<WeightBandKey>("UP_TO_5KG");
  const [total, setTotal] = React.useState(6.5);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    // Kicking off a server fetch when `size` changes and flagging it as
    // in-flight is a genuine sync-with-external-system effect, not derivable
    // render-time state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    quoteDelivery({ speed: "STANDARD", distanceKm: MOCK_DISTANCE_KM, weightBand: size })
      .then((q) => {
        if (!cancelled) setTotal(q.total);
      })
      .catch(() => {
        /* fall back to the last known total if the API is unreachable */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [size]);

  return (
    <div className="p-6 flex flex-col gap-3.5 bg-card border border-divider rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <span className="text-xl font-semibold">Quick quote</span>
        <Tag variant="accent">No sign-up needed</Tag>
      </div>
      <Field label="Pickup">
        <Input value={pickup} onChange={(e) => setPickup(e.target.value)} />
      </Field>
      <Field label="Drop-off">
        <Input value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
      </Field>
      <Field label="Size">
        <Segmented
          name="quick-size"
          value={size}
          onChange={setSize}
          className="w-full"
          options={SIZE_OPTIONS}
        />
      </Field>
      <div className="flex justify-between items-end pt-3 border-t border-divider">
        <div>
          <div className="text-xs text-neutral-600">Estimated from</div>
          <div className="text-[40px] font-semibold leading-none">
            {loading ? "…" : fmtUsd(total)}
          </div>
        </div>
        <div className="text-[13px] text-neutral-700 text-right">
          {MOCK_DISTANCE_KM} km · Standard
          <br />
          Arrives today by 18:00
        </div>
      </div>
      <LinkButton href="/logistics/book" variant="primary" className="h-10">
        Continue booking <Icon name="arrow" size={14} />
      </LinkButton>
    </div>
  );
}

export default function LogisticsHomePage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = React.useState("");

  function goTrack() {
    router.push(
      trackingId ? `/logistics/track?id=${encodeURIComponent(trackingId)}` : "/logistics/track",
    );
  }

  return (
    <>
      <Header business="logistics" active="home" />
      <main className="flex-1">
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1fr)_460px] gap-14 items-start">
          <div className="flex flex-col gap-5 pt-3">
            <span className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
              Instanta Logistics
            </span>
            <h1 className="text-[clamp(36px,4.8vw,64px)] leading-[1.05]">
              Send it. We&apos;ll handle the rest.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg">
              Door-to-door pickup and delivery across 20+ cities, with a live
              price before you book and a live map until it arrives.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton href="/logistics/book" variant="primary" className="text-base px-6 py-3">
                Send a package
              </LinkButton>
              <LinkButton href="/logistics/track" variant="secondary" className="text-base px-6 py-3">
                Track delivery
              </LinkButton>
            </div>
          </div>
          <QuickQuote />
        </section>

        {/* Answers */}
        <section className="ins-container pt-24">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ANSWERS.map((a) => (
              <div
                key={a.title}
                className="p-6 border border-divider rounded-lg bg-card flex flex-col gap-2.5 min-h-[220px]"
              >
                <div className="flex justify-between text-accent">
                  <Icon name={a.icon} size={24} />
                  <span className="text-xs text-neutral-600">{a.q}</span>
                </div>
                <div className="text-2xl font-semibold mt-auto leading-tight">
                  {a.title}
                </div>
                <p className="text-sm text-neutral-700 m-0">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery options */}
        <section className="ins-container pt-24 grid lg:grid-cols-[320px_minmax(0,1fr)] gap-12">
          <div>
            <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2.5">
              Delivery options
            </div>
            <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight mb-3">
              Clear prices, before you book.
            </h2>
            <p className="text-sm text-neutral-700">
              Prices are for parcels up to 5 kg within one city. Distance and
              weight are added transparently at checkout.
            </p>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Option</Th>
                <Th>Speed</Th>
                <Th>Best for</Th>
                <Th className="text-right">From</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {SPEEDS.map((s) => (
                <Tr key={s.key}>
                  <Td>
                    <span className="flex items-center gap-2.5 text-xl font-semibold">
                      <Icon name={s.icon} size={18} className="text-accent" />
                      {s.name}
                    </span>
                  </Td>
                  <Td>{s.time}</Td>
                  <Td className="text-neutral-700">{s.best}</Td>
                  <Td className="text-right text-xl font-semibold">{fmtUsd(s.price)}</Td>
                  <Td className="text-right">
                    <Link href="/logistics/book" className="text-accent-700 text-sm font-medium no-underline hover:underline">
                      Book
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </section>

        {/* Services */}
        <section className="ins-container pt-24">
          <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2.5">
            Services
          </div>
          <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight mb-7">
            For one parcel or ten thousand.
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(LOGISTICS_SERVICES).map((s) => (
              <Link
                key={s.slug}
                href={`/logistics/services/${s.slug}`}
                className="p-6 flex flex-col gap-2.5 rounded-lg border border-divider bg-card no-underline text-text hover:border-accent-300 hover:bg-accent-100/40 transition-colors"
              >
                <Icon name={s.icon} size={22} className="text-accent-700" />
                <div className="text-xl font-semibold">{s.name}</div>
                <p className="text-sm text-neutral-700 m-0 flex-1">{s.short}</p>
                <span className="flex items-center gap-1.5 text-[13px] text-accent-700">
                  Learn more <Icon name="arrow" size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Track CTA band */}
        <section className="ins-container pt-24 pb-24">
          <div className="bg-accent-900 text-white p-10 rounded-2xl flex flex-wrap items-center gap-8">
            <div className="mr-auto">
              <div className="text-2xl md:text-4xl font-semibold leading-tight">
                Where&apos;s my package?
              </div>
              <div className="text-[15px] text-accent-200 mt-1.5">
                Enter the tracking ID from your SMS or email.
              </div>
            </div>
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goTrack()}
              placeholder="INS-23892"
              className="w-[260px] sm:w-[320px] h-11 px-3 text-sm bg-transparent text-white border border-accent-700 rounded-md outline-none placeholder:text-accent-300"
            />
            <button
              onClick={goTrack}
              className="inline-flex items-center justify-center gap-[7px] whitespace-nowrap cursor-pointer font-semibold text-sm rounded-[0.4rem] border border-white bg-white text-accent-900 hover:bg-accent-100 h-11 px-4"
            >
              Track
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
