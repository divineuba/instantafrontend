import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FlowBar } from "@/components/travels/flow-bar";
import { getOffer, fmtUsd, minutesToHm, FARE_RULES } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// This page has no sensible static shell: every render depends on the
// ?offer= query param and a live fetch of that offer. Opt out of the
// instant-navigation prerender requirement instead of wrapping the whole
// page in a Suspense boundary just to satisfy it.
export const instant = false;

export default async function TravelsDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const { offer: offerId } = await searchParams;
  if (!offerId) notFound();

  const offer = await getOffer(offerId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!offer) notFound();

  const legs = [
    {
      dir: "Outbound",
      date: offer.outboundDate,
      dur: minutesToHm(offer.outboundDurationMin),
      stopsLabel: offer.outboundStopsLabel,
      dep: offer.outboundDepart,
      arr: offer.outboundArrive,
      fromFull: `${offer.originCity} (${offer.originCode})`,
      toFull: `${offer.destinationCity} (${offer.destinationCode})`,
      flightNo: offer.outboundFlightNo,
    },
    {
      dir: "Return",
      date: offer.returnDate,
      dur: minutesToHm(offer.returnDurationMin),
      stopsLabel: offer.returnStopsLabel,
      dep: offer.returnDepart,
      arr: offer.returnArrive,
      fromFull: `${offer.destinationCity} (${offer.destinationCode})`,
      toFull: `${offer.originCity} (${offer.originCode})`,
      flightNo: offer.returnFlightNo,
    },
  ];

  const total = Number(offer.price);
  const baseFare = Math.round(total * (612 / 808.4) * 100) / 100;
  const fees = 12;
  const taxes = Math.round((total - baseFare - fees) * 100) / 100;

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${offer.originCity} to ${offer.destinationCity}, return`}
        dateLabel={`${offer.outboundDate} → ${offer.returnDate}`}
        step={1}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Link href="/travels/results" className="inline-flex items-center gap-1.5 text-sm text-accent-700 no-underline hover:underline">
            <Icon name="back" size={14} />
            Back to results
          </Link>
          <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0">
            {offer.originCity} to {offer.destinationCity}, return
          </h1>

          {legs.map((leg) => (
            <div key={leg.dir} className="p-6 border border-divider rounded-xl bg-card">
              <div className="flex justify-between mb-4.5 flex-wrap gap-2">
                <span className="text-[11px] tracking-[.12em] uppercase text-accent-700 font-semibold">{leg.dir}</span>
                <span className="text-[13px] text-neutral-700">{leg.date} · {leg.dur} · {leg.stopsLabel}</span>
              </div>
              <div className="grid grid-cols-[90px_20px_minmax(0,1fr)] gap-x-4">
                <div className="text-[28px] font-semibold leading-none">{leg.dep}</div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 border-[1.5px] border-accent mt-1.5 rounded-sm" />
                  <span className="flex-1 w-px bg-accent" />
                </div>
                <div className="pb-5">
                  <div className="text-base font-medium">{leg.fromFull}</div>
                  <div className="flex gap-4 mt-3.5 text-[13px] text-neutral-700 flex-wrap">
                    <span>{offer.airlineName} · {leg.flightNo}</span>
                    <span>{offer.aircraft}</span>
                    <span>{offer.cabinClass} · Y</span>
                  </div>
                </div>
                <div className="text-[28px] font-semibold leading-none">{leg.arr}</div>
                <div className="flex justify-center">
                  <span className="w-2.5 h-2.5 bg-accent mt-1.5 rounded-sm" />
                </div>
                <div>
                  <div className="text-base font-medium">{leg.toFull}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="grid sm:grid-cols-3 gap-4">
            {FARE_RULES.map((r) => (
              <div key={r.k} className="p-4.5 border border-divider rounded-xl bg-card flex gap-3">
                <Icon name={r.icon} size={18} className="text-accent shrink-0" />
                <div>
                  <div className="text-xs text-neutral-600">{r.k}</div>
                  <div className="text-sm">{r.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="p-6 border border-divider rounded-xl bg-card sticky top-6 flex flex-col gap-3">
          <span className="text-xl font-semibold">Fare summary</span>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">1 adult · {offer.fareLabel}</span>
            <span>{fmtUsd(baseFare)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">Taxes and charges</span>
            <span>{fmtUsd(taxes)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">Instanta service fee</span>
            <span>{fmtUsd(fees)}</span>
          </div>
          <div className="flex justify-between items-end pt-3 border-t border-divider">
            <span className="text-sm">Total</span>
            <span className="text-[40px] font-semibold leading-none">{fmtUsd(total)}</span>
          </div>
          <LinkButton href={`/travels/passengers?offer=${offer.id}`} variant="primary" className="h-11 text-base">
            Continue booking
          </LinkButton>
          <div className="text-xs text-neutral-600 flex gap-1.5">
            <Icon name="clock" size={14} />
            Fare held for 20 minutes once you continue.
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
