"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { FlowBar } from "@/components/travels/flow-bar";
import {
  searchFlights,
  minutesToHm,
  fmtUsd,
  type FlightSort,
  type SearchFlightsResponse,
} from "@/lib/travels";

const SORT_LABELS: { key: FlightSort; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
  { key: "earliest", label: "Earliest" },
];

const STOP_LABELS = ["Nonstop", "1 stop", "2+ stops"];

function ResultsBody() {
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "Lagos · LOS";
  const to = searchParams.get("to") ?? "London · LHR";
  const origin = searchParams.get("origin") ?? "LOS";
  const destination = searchParams.get("destination") ?? "LHR";
  const departDate = searchParams.get("departDate") ?? "2026-10-12";
  const returnDate = searchParams.get("returnDate") ?? "";

  const [sort, setSort] = React.useState<FlightSort>("recommended");
  const [stops, setStops] = React.useState<boolean[]>([true, true, true]);
  const [airlineFilter, setAirlineFilter] = React.useState<Set<string>>(new Set());
  const [data, setData] = React.useState<SearchFlightsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const runSearch = React.useCallback(() => {
    const activeStops = stops.flatMap((on, i) => (on ? [i] : []));
    setLoading(true);
    setError(false);
    searchFlights({
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      sort,
      stops: activeStops.length < 3 ? activeStops : undefined,
      airlines: airlineFilter.size > 0 ? Array.from(airlineFilter) : undefined,
    })
      .then(setData)
      .catch(() => {
        setData(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [origin, destination, departDate, returnDate, sort, stops, airlineFilter]);

  React.useEffect(() => {
    // Re-querying the server whenever sort/stops/airline filters change and
    // flagging in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSearch();
  }, [runSearch]);

  function toggleStop(i: number) {
    setStops((s) => s.map((v, j) => (j === i ? !v : v)));
  }

  function toggleAirline(code: string) {
    setAirlineFilter((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function resetFilters() {
    setStops([true, true, true]);
    setAirlineFilter(new Set());
  }

  const dateLabel = returnDate
    ? `${departDate} → ${returnDate}`
    : departDate;

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar routeLabel={`${from.split(" · ")[0]} to ${to.split(" · ")[0]}, return`} dateLabel={dateLabel} step={1} />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Stops</span>
            <button type="button" onClick={resetFilters} className="text-xs text-accent-700 bg-transparent border-0 cursor-pointer">
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {STOP_LABELS.map((label, i) => {
              const fromPrice = data?.stopCounts.find((s) => s.stops === i)?.fromPrice;
              return (
                <label key={label} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={stops[i]} onChange={() => toggleStop(i)} />
                    {label}
                  </span>
                  <span className="text-[13px] text-neutral-600">
                    {fromPrice !== undefined ? `$${fromPrice}` : "—"}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex flex-col gap-2.5 pt-4 border-t border-divider">
            <span className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Airlines</span>
            {(data?.airlines ?? []).map((a) => (
              <label key={a.code} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!airlineFilter.has(a.code)}
                    onChange={() => toggleAirline(a.code)}
                  />
                  {a.name}
                </span>
                <span className="text-[13px] text-neutral-600">{a.count}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className="flex flex-col gap-3.5 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-divider rounded-xl overflow-hidden">
            {SORT_LABELS.map((s) => {
              const summary = data?.sortSummaries.find((x) => x.key === s.key);
              const active = sort === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className={`text-left p-3.5 border-r border-b-2 border-divider last:border-r-0 cursor-pointer ${
                    active ? "bg-accent-100/40 border-b-accent" : "bg-transparent border-b-transparent"
                  }`}
                >
                  <div className="text-[17px] font-semibold">{s.label}</div>
                  <div className="text-[13px] text-neutral-700">{summary?.label ?? "—"}</div>
                </button>
              );
            })}
          </div>

          <div className="text-[13px] text-neutral-600">
            {loading
              ? "Searching…"
              : error
                ? "Search failed"
                : `${data?.resultCount ?? 0} flights · prices are per adult, return, including taxes`}
          </div>

          {!loading && error && (
            <div className="p-14 border border-divider rounded-xl bg-card flex flex-col items-center gap-3 text-center">
              <Icon name="alert" size={30} className="text-error" />
              <div className="text-2xl font-semibold">Something went wrong</div>
              <p className="text-sm text-neutral-700 m-0">
                We couldn&apos;t reach the flight search service. Check your connection and try again.
              </p>
              <Button variant="secondary" onClick={runSearch}>Try again</Button>
            </div>
          )}

          {!loading && !error && data?.noResults && (
            <div className="p-14 border border-divider rounded-xl bg-card flex flex-col items-center gap-3 text-center">
              <Icon name="plane" size={30} className="text-neutral-500" />
              <div className="text-2xl font-semibold">No flights match these filters</div>
              <p className="text-sm text-neutral-700 m-0">Try allowing stops or widening the price range.</p>
              <Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
            </div>
          )}

          {(loading ? Array.from({ length: 3 }) : data?.offers ?? []).map((offer, i) => {
            const o = offer as SearchFlightsResponse["offers"][number] | undefined;
            return (
              <article
                key={o?.id ?? i}
                className="border border-divider rounded-xl bg-card grid sm:grid-cols-[minmax(0,1fr)_220px]"
              >
                <div className="p-5 flex flex-col gap-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 border border-divider rounded-xl grid place-items-center text-[13px] font-semibold">
                      {o?.airlineCode ?? "··"}
                    </span>
                    <span className="text-sm font-medium">{o?.airlineName ?? "Loading…"}</span>
                    {o?.hasBadge && <Tag variant="accent">{o.badge}</Tag>}
                  </div>
                  {o && (
                    <>
                      <div className="text-xs text-neutral-700 sm:hidden">{o.outboundDate}</div>
                      <div className="grid grid-cols-[52px_minmax(0,1fr)_52px] sm:grid-cols-[70px_minmax(0,1fr)_70px_110px] gap-2 sm:gap-4 items-center">
                        <div>
                          <div className="text-xl sm:text-2xl font-semibold leading-none">{o.outboundDepart}</div>
                          <div className="text-xs text-neutral-600">{o.originCode}</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-neutral-700">{minutesToHm(o.outboundDurationMin)}</span>
                          <span className="w-full h-px bg-neutral-400" />
                          <span className={`text-xs ${o.outboundStops === 0 ? "text-accent-700" : "text-neutral-700"}`}>
                            {o.outboundStopsLabel}
                          </span>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-semibold leading-none">{o.outboundArrive}</div>
                          <div className="text-xs text-neutral-600">{o.destinationCode}</div>
                        </div>
                        <div className="hidden sm:block text-xs text-neutral-700">{o.outboundDate}</div>
                      </div>
                      <div className="text-xs text-neutral-700 sm:hidden">{o.returnDate}</div>
                      <div className="grid grid-cols-[52px_minmax(0,1fr)_52px] sm:grid-cols-[70px_minmax(0,1fr)_70px_110px] gap-2 sm:gap-4 items-center">
                        <div>
                          <div className="text-xl sm:text-2xl font-semibold leading-none">{o.returnDepart}</div>
                          <div className="text-xs text-neutral-600">{o.destinationCode}</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-neutral-700">{minutesToHm(o.returnDurationMin)}</span>
                          <span className="w-full h-px bg-neutral-400" />
                          <span className={`text-xs ${o.returnStops === 0 ? "text-accent-700" : "text-neutral-700"}`}>
                            {o.returnStopsLabel}
                          </span>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-semibold leading-none">{o.returnArrive}</div>
                          <div className="text-xs text-neutral-600">{o.originCode}</div>
                        </div>
                        <div className="hidden sm:block text-xs text-neutral-700">{o.returnDate}</div>
                      </div>
                      <div className="flex gap-4 text-xs text-neutral-700">
                        <span className="flex items-center gap-1.5">
                          <Icon name="briefcase" size={13} />
                          {o.baggage}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="refresh" size={13} />
                          {o.changePolicy}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-divider p-5 flex flex-col justify-between gap-2.5">
                  {o && (
                    <>
                      <div>
                        <div className="text-xs text-neutral-600">{o.fareLabel}</div>
                        <div className="text-[40px] font-semibold leading-none">{fmtUsd(o.price)}</div>
                      </div>
                      <Link
                        href={`/travels/detail?offer=${o.id}`}
                        className="inline-flex items-center justify-center gap-[7px] whitespace-nowrap no-underline font-semibold text-sm leading-tight rounded-[0.4rem] border border-accent bg-accent text-white hover:bg-accent-700 hover:border-accent-700 px-4 py-[9px]"
                      >
                        Select
                      </Link>
                      <Link
                        href={`/travels/detail?offer=${o.id}`}
                        className="inline-flex items-center justify-center text-[13px] text-accent-700 no-underline hover:underline"
                      >
                        Flight details
                      </Link>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function TravelsResultsPage() {
  return (
    <React.Suspense fallback={null}>
      <ResultsBody />
    </React.Suspense>
  );
}
