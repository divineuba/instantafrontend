"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scene } from "@/components/illustrations/scene";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import {
  getPopularRoutes,
  defaultDepartDate,
  defaultReturnDate,
  TRAVEL_WHY,
  type CabinClass,
  type PopularRoute,
} from "@/lib/travels";

type TripType = "return" | "oneway" | "multicity";

interface LegInput {
  from: string;
  to: string;
  departDate: string;
}

/** "Lagos · LOS" -> "LOS": search inputs are free text, the API wants the IATA code. */
function extractCode(label: string) {
  const parts = label.split("·").map((p) => p.trim());
  return parts[parts.length - 1] || label.trim();
}

export default function TravelsHomePage() {
  const router = useRouter();
  const [trip, setTrip] = React.useState<TripType>("return");
  const [direct, setDirect] = React.useState(false);
  const [from, setFrom] = React.useState("Lagos · LOS");
  const [to, setTo] = React.useState("London · LHR");
  const [departDate, setDepartDate] = React.useState("");
  const [returnDate, setReturnDate] = React.useState("");
  const [multiLegs, setMultiLegs] = React.useState<LegInput[]>([
    { from: "Lagos · LOS", to: "London · LHR", departDate: "" },
    { from: "London · LHR", to: "Dubai · DXB", departDate: "" },
  ]);
  const [adults, setAdults] = React.useState(1);
  const [cabinClass, setCabinClass] = React.useState<CabinClass>("Economy");
  const [routes, setRoutes] = React.useState<PopularRoute[]>([]);
  const [routesLoading, setRoutesLoading] = React.useState(true);

  React.useEffect(() => {
    // `new Date()` is an unstable value during static prerendering, so the
    // "today"-relative defaults are computed here on mount rather than in
    // the useState initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDepartDate(defaultDepartDate());
    setReturnDate(defaultReturnDate());
    setMultiLegs((legs) => legs.map((l, i) => ({ ...l, departDate: isoDatePlusDays(30 + i * 7) })));
  }, []);

  React.useEffect(() => {
    // Loading the popular-routes strip from the server and flagging it as
    // in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoutesLoading(true);
    getPopularRoutes()
      .then(setRoutes)
      .catch(() => {})
      .finally(() => setRoutesLoading(false));
  }, []);

  function isoDatePlusDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function addLeg() {
    setMultiLegs((legs) => {
      const last = legs[legs.length - 1];
      return [...legs, { from: last?.to ?? "", to: "", departDate: last?.departDate ?? departDate }];
    });
  }

  function removeLeg(i: number) {
    setMultiLegs((legs) => legs.filter((_, j) => j !== i));
  }

  function updateLeg(i: number, patch: Partial<LegInput>) {
    setMultiLegs((legs) => legs.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  function search() {
    const legs =
      trip === "oneway"
        ? [{ fromLabel: from, toLabel: to, origin: extractCode(from), destination: extractCode(to), departDate }]
        : trip === "return"
          ? [
              { fromLabel: from, toLabel: to, origin: extractCode(from), destination: extractCode(to), departDate },
              { fromLabel: to, toLabel: from, origin: extractCode(to), destination: extractCode(from), departDate: returnDate },
            ]
          : multiLegs.map((l) => ({
              fromLabel: l.from,
              toLabel: l.to,
              origin: extractCode(l.from),
              destination: extractCode(l.to),
              departDate: l.departDate,
            }));

    const qs = new URLSearchParams({
      legs: JSON.stringify(legs),
      tripType: trip,
      adults: String(adults),
      cabinClass,
      direct: direct ? "1" : "0",
    });
    router.push(`/travels/results?${qs.toString()}`);
  }

  const canSearch =
    trip === "multicity"
      ? multiLegs.length >= 1 && multiLegs.every((l) => l.from && l.to && l.departDate)
      : Boolean(from && to && departDate && (trip !== "return" || returnDate));

  return (
    <>
      <Header business="travels" active="home" />
      <main className="flex-1">
        <section className="relative border-b border-divider">
          <div className="absolute inset-0">
            <Scene variant="travel" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-accent-900/40 to-accent-900/10" />
          </div>
          <div className="relative ins-container pt-20 pb-16 text-white">
            <span className="text-[11px] tracking-[.14em] uppercase text-accent-200">
              Instanta Travels
            </span>
            <h1 className="text-[clamp(36px,5vw,64px)] leading-[1.05] my-4">
              Your journey starts here.
            </h1>
            <p className="text-lg max-w-lg text-accent-100 mb-8">
              Compare fares across hundreds of airlines, book in minutes and
              keep every ticket in your Instanta account.
            </p>
            <div className="bg-bg text-text p-6 rounded-xl shadow-lg flex flex-col gap-4">
              <div className="flex gap-4 items-center flex-wrap">
                <Segmented
                  name="trip"
                  value={trip}
                  onChange={setTrip}
                  options={[
                    { value: "return", label: "Return" },
                    { value: "oneway", label: "One way" },
                    { value: "multicity", label: "Multi-city" },
                  ]}
                />
                <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                  <input type="checkbox" checked={direct} onChange={(e) => setDirect(e.target.checked)} />
                  Direct flights only
                </label>
              </div>

              {trip !== "multicity" ? (
                <div className="grid md:grid-cols-[minmax(0,1.2fr)_36px_minmax(0,1.2fr)_repeat(2,minmax(0,.8fr))_minmax(0,1fr)_minmax(0,.8fr)_auto] gap-3 items-end">
                  <Field label="From">
                    <Input value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 text-base" />
                  </Field>
                  <button
                    type="button"
                    onClick={() => {
                      setFrom(to);
                      setTo(from);
                    }}
                    className="h-11 w-9 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100 flex items-center justify-center self-end"
                    aria-label="Swap origin and destination"
                  >
                    <Icon name="swap" size={16} />
                  </button>
                  <Field label="To">
                    <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-11 text-base" />
                  </Field>
                  <Field label="Departure">
                    <Input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} className="h-11" />
                  </Field>
                  <Field label="Return">
                    <Input
                      type="date"
                      value={returnDate}
                      disabled={trip !== "return"}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="h-11"
                    />
                  </Field>
                  <Field label="Passengers">
                    <Select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="h-11">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} adult{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Class">
                    <Select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)} className="h-11">
                      <option>Economy</option>
                      <option>Premium</option>
                      <option>Business</option>
                      <option>First</option>
                    </Select>
                  </Field>
                  <button
                    type="button"
                    disabled={!canSearch}
                    onClick={search}
                    className="h-11 px-6 rounded-[0.4rem] bg-accent hover:bg-accent-700 text-white font-semibold text-base flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <Icon name="search" size={16} />
                    Search flights
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {multiLegs.map((leg, i) => (
                    <div key={i} className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_32px] gap-3 items-end">
                      <Field label={`Leg ${i + 1} · From`}>
                        <Input value={leg.from} onChange={(e) => updateLeg(i, { from: e.target.value })} className="h-11 text-base" />
                      </Field>
                      <Field label="To">
                        <Input value={leg.to} onChange={(e) => updateLeg(i, { to: e.target.value })} className="h-11 text-base" />
                      </Field>
                      <Field label="Departure">
                        <Input
                          type="date"
                          value={leg.departDate}
                          onChange={(e) => updateLeg(i, { departDate: e.target.value })}
                          className="h-11"
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeLeg(i)}
                        disabled={multiLegs.length <= 1}
                        className="h-11 w-8 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100 flex items-center justify-center self-end disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Remove leg"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-3 items-end flex-wrap">
                    <button
                      type="button"
                      onClick={addLeg}
                      disabled={multiLegs.length >= 6}
                      className="h-10 px-3.5 rounded-md border border-dashed border-neutral-400 bg-transparent hover:bg-neutral-100 text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="search" size={14} />
                      Add another flight
                    </button>
                    <Field label="Passengers">
                      <Select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="h-11">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} adult{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Class">
                      <Select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)} className="h-11">
                        <option>Economy</option>
                        <option>Premium</option>
                        <option>Business</option>
                        <option>First</option>
                      </Select>
                    </Field>
                    <button
                      type="button"
                      disabled={!canSearch}
                      onClick={search}
                      className="h-11 px-6 rounded-[0.4rem] bg-accent hover:bg-accent-700 text-white font-semibold text-base flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-45 disabled:cursor-not-allowed ml-auto"
                    >
                      <Icon name="search" size={16} />
                      Search flights
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="ins-container pt-20">
          <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
            <div>
              <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2.5">
                Popular from Lagos
              </div>
              <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight m-0">
                Where people are flying.
              </h2>
            </div>
            <Tag variant="neutral">Sample fares · return, economy</Tag>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(routesLoading ? Array.from({ length: 8 }) : routes).map((r, i) => {
              const route = r as PopularRoute | undefined;
              return (
                <Link
                  key={route?.id ?? i}
                  href="/travels/results"
                  className="p-5 border border-divider rounded-lg bg-card flex flex-col gap-1.5 no-underline text-text hover:border-accent-300 hover:bg-accent-100/40 transition-colors"
                >
                  <span className="text-xs text-neutral-600">{route?.code ?? "···"}</span>
                  <span className="text-2xl font-semibold leading-none">{route?.city ?? "Loading"}</span>
                  <span className="text-[13px] text-neutral-700">{route?.meta ?? ""}</span>
                  <span className="mt-2.5 text-sm">
                    from{" "}
                    <strong className="text-xl font-semibold">
                      {route ? `$${route.price}` : "—"}
                    </strong>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ins-container pt-20 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {TRAVEL_WHY.map((w) => (
            <div key={w.t} className="flex flex-col gap-2.5">
              <Icon name={w.icon} size={28} className="text-accent" />
              <div className="text-xl font-semibold">{w.t}</div>
              <p className="text-sm text-neutral-700 m-0">{w.d}</p>
            </div>
          ))}
        </section>

        <section className="ins-container pt-20 pb-24">
          <div className="bg-accent-900 text-white p-6 sm:p-10 rounded-2xl flex flex-wrap items-center gap-6">
            <div className="text-2xl sm:text-4xl font-semibold leading-tight mr-auto">
              Flying for business?
            </div>
            <LinkButton href="/business" variant="inverse" className="h-11">
              Corporate travel
            </LinkButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
