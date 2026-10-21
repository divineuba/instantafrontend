import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FlowBar } from "@/components/travels/flow-bar";
import { getOffer, confirmPrice, fmtUsd, minutesToHm, tripTypeLabel, type TripType } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// This page has no sensible static shell: every render depends on the
// ?offer= query param and a live fetch of that offer. Opt out of the
// instant-navigation prerender requirement instead of wrapping the whole
// page in a Suspense boundary just to satisfy it.
export const instant = false;

function tripTypeOf(legCount: number): TripType {
  if (legCount <= 1) return "ONE_WAY";
  if (legCount === 2) return "ROUND_TRIP";
  return "MULTI_CITY";
}

export default async function TravelsDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string; adults?: string }>;
}) {
  const { offer: offerId, adults: adultsParam } = await searchParams;
  if (!offerId) notFound();

  const offer = await getOffer(offerId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!offer) notFound();

  const adults = Number(adultsParam ?? "1") || 1;
  const tripType = tripTypeOf(offer.legs.length);

  const priced = await confirmPrice(offer.id).catch(() => null);
  const fareRules = priced?.fareRules ?? [
    "Fare conditions vary by airline — confirm the exact rules at booking.",
  ];

  const total = priced?.price ?? Number(offer.price);
  const serviceFee = 12;
  const baseFare = Math.round((total - serviceFee) * 0.76 * 100) / 100;
  const taxes = Math.round((total - baseFare - serviceFee) * 100) / 100;

  const firstLeg = offer.legs[0];
  const lastLeg = offer.legs[offer.legs.length - 1];

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${firstLeg.originCity} to ${lastLeg.destinationCity}, ${tripTypeLabel(tripType)}`}
        dateLabel={offer.legs.map((l) => l.date).join(" → ")}
        step={1}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Link href="/travels/results" className="inline-flex items-center gap-1.5 text-sm text-accent-700 no-underline hover:underline">
            <Icon name="back" size={14} />
            Back to results
          </Link>
          <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0">
            {firstLeg.originCity} to {lastLeg.destinationCity}, {tripTypeLabel(tripType)}
          </h1>

          {offer.legs.map((leg, i) => (
            <div key={leg.id} className="p-6 border border-divider rounded-xl bg-card">
              <div className="flex justify-between mb-4.5 flex-wrap gap-2">
                <span className="text-[11px] tracking-[.12em] uppercase text-accent-700 font-semibold">
                  {offer.legs.length > 2 ? `Flight ${i + 1}` : i === 0 ? "Outbound" : "Return"}
                </span>
                <span className="text-[13px] text-neutral-700">{leg.date} · {minutesToHm(leg.durationMin)} · {leg.stopsLabel}</span>
              </div>
              <div className="grid grid-cols-[90px_20px_minmax(0,1fr)] gap-x-4">
                <div className="text-[28px] font-semibold leading-none">{leg.depart}</div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 border-[1.5px] border-accent mt-1.5 rounded-sm" />
                  <span className="flex-1 w-px bg-accent" />
                </div>
                <div className="pb-5">
                  <div className="text-base font-medium">{leg.originCity} ({leg.originCode})</div>
                  <div className="flex gap-4 mt-3.5 text-[13px] text-neutral-700 flex-wrap">
                    <span>{offer.airlineName} · {leg.flightNo}</span>
                    <span>{offer.aircraft}</span>
                    <span>{offer.cabinClass}</span>
                  </div>
                </div>
                <div className="text-[28px] font-semibold leading-none">{leg.arrive}</div>
                <div className="flex justify-center">
                  <span className="w-2.5 h-2.5 bg-accent mt-1.5 rounded-sm" />
                </div>
                <div>
                  <div className="text-base font-medium">{leg.destinationCity} ({leg.destinationCode})</div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-5 border border-divider rounded-xl bg-card flex flex-col gap-2.5">
            <span className="text-xs tracking-[.1em] uppercase text-neutral-600">Fare rules</span>
            <ul className="flex flex-col gap-2 m-0 pl-0 list-none">
              {fareRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Icon name="file" size={15} className="text-accent shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4.5 border border-divider rounded-xl bg-card flex gap-3">
              <Icon name="briefcase" size={18} className="text-accent shrink-0" />
              <div>
                <div className="text-xs text-neutral-600">Baggage</div>
                <div className="text-sm">{offer.baggage}</div>
              </div>
            </div>
            <div className="p-4.5 border border-divider rounded-xl bg-card flex gap-3">
              <Icon name="refresh" size={18} className="text-accent shrink-0" />
              <div>
                <div className="text-xs text-neutral-600">Changes</div>
                <div className="text-sm">{offer.changePolicy}</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="p-6 border border-divider rounded-xl bg-card sticky top-6 flex flex-col gap-3">
          <span className="text-xl font-semibold">Fare summary</span>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">
              {adults} adult{adults > 1 ? "s" : ""} · {offer.fareLabel}
            </span>
            <span>{fmtUsd(baseFare)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">Taxes and charges</span>
            <span>{fmtUsd(taxes)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-700">Instanta service fee</span>
            <span>{fmtUsd(serviceFee)}</span>
          </div>
          <div className="flex justify-between items-end pt-3 border-t border-divider">
            <span className="text-sm">Total</span>
            <span className="text-[40px] font-semibold leading-none">{fmtUsd(total)}</span>
          </div>
          <LinkButton href={`/travels/passengers?offer=${offer.id}&adults=${adults}`} variant="primary" className="h-11 text-base">
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
