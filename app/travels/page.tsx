"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { getPopularRoutes, TRAVEL_WHY, type PopularRoute } from "@/lib/travels";

type TripType = "return" | "oneway" | "multicity";

export default function TravelsHomePage() {
  const router = useRouter();
  const [trip, setTrip] = React.useState<TripType>("return");
  const [direct, setDirect] = React.useState(false);
  const [from, setFrom] = React.useState("Lagos · LOS");
  const [to, setTo] = React.useState("London · LHR");
  const [departDate, setDepartDate] = React.useState("2026-10-12");
  const [returnDate, setReturnDate] = React.useState("2026-10-25");
  const [adults, setAdults] = React.useState(1);
  const [cabinClass, setCabinClass] = React.useState("Economy");
  const [routes, setRoutes] = React.useState<PopularRoute[]>([]);
  const [routesLoading, setRoutesLoading] = React.useState(true);

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

  function search() {
    const qs = new URLSearchParams({
      from,
      to,
      departDate,
      returnDate: trip === "return" ? returnDate : "",
      adults: String(adults),
      cabinClass,
      trip,
      direct: direct ? "1" : "0",
    });
    router.push(`/travels/results?${qs.toString()}`);
  }

  return (
    <>
      <Header business="travels" active="home" />
      <main className="flex-1">
        <section className="relative border-b border-divider">
          <div className="absolute inset-0">
            <Image src="/images/hero.jpg" alt="" fill sizes="100vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-accent-900/70 to-accent-900/30" />
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
                  <Select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="h-11">
                    <option>Economy</option>
                    <option>Premium</option>
                    <option>Business</option>
                    <option>First</option>
                  </Select>
                </Field>
                <button
                  type="button"
                  onClick={search}
                  className="h-11 px-6 rounded-[0.4rem] bg-accent hover:bg-accent-700 text-white font-semibold text-base flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <Icon name="search" size={16} />
                  Search flights
                </button>
              </div>
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
