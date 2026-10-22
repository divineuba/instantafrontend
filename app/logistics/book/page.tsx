"use client";

import * as React from "react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { AddressAutocomplete } from "@/components/logistics/address-autocomplete";
import { ApiError } from "@/lib/api";
import {
  SPEEDS,
  WEIGHT_BANDS,
  fmtUsd,
  quoteDelivery,
  createDelivery,
  getPickupWindows,
  type DeliverySpeedKey,
  type WeightBandKey,
  type Delivery,
  type PickupCity,
  type QuoteResponse,
} from "@/lib/logistics";

/** Quoting hits the backend's real Mapbox geocoding seam on every address
 * keystroke, so debounce it rather than re-quoting on every character. */
const QUOTE_DEBOUNCE_MS = 400;

/** The city a pickup address names, if it names exactly one of them. */
function cityInAddress(cities: PickupCity[], address: string): PickupCity | undefined {
  const text = address.toLowerCase();
  const named = cities.filter((c) => text.includes(c.name.toLowerCase()));
  return named.length === 1 ? named[0] : undefined;
}

const STEP_DEFS: { label: string; icon: IconName }[] = [
  { label: "Pickup", icon: "pin" },
  { label: "Destination", icon: "pin" },
  { label: "Package", icon: "package" },
  { label: "Delivery type", icon: "truck" },
  { label: "Review", icon: "check" },
];

const STEP_TITLES = [
  "Where should we pick up?",
  "Where is it going?",
  "What are you sending?",
  "How fast?",
  "Check and book",
];

const PACKAGE_TYPES: { label: string; icon: IconName; fragile: boolean }[] = [
  { label: "Documents", icon: "file", fragile: false },
  { label: "Small parcel", icon: "package", fragile: false },
  { label: "Box", icon: "layers", fragile: false },
  { label: "Fragile", icon: "alert", fragile: true },
];

interface FormState {
  pickupAddress: string;
  pickupContact: string;
  pickupPhone: string;
  pickupNotes: string;
  destinationAddress: string;
  destinationContact: string;
  destinationPhone: string;
  sendSms: boolean;
  packageTypeIdx: number;
  weightBand: WeightBandKey;
  packageSize: string;
  packageDescription: string;
  insured: boolean;
  speed: DeliverySpeedKey;
  /** Scheduled pickups: the city, its local date (yyyy-mm-dd) and the chosen
   * slot's `startsAt`, all from the server's pickup-window list. */
  pickupCityId: string;
  scheduleDate: string;
  scheduleSlot: string;
}

const INITIAL_STATE: FormState = {
  pickupAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
  pickupContact: "Divine Okafor",
  pickupPhone: "+234 803 555 0142",
  pickupNotes: "",
  destinationAddress: "24 Awolowo Road, Ikoyi, Lagos",
  destinationContact: "Tolu Adeyemi",
  destinationPhone: "+234 809 555 0187",
  sendSms: true,
  packageTypeIdx: 0,
  weightBand: "UP_TO_5KG",
  packageSize: "Fits in a backpack",
  packageDescription: "Signed contract documents in an envelope",
  insured: true,
  speed: "EXPRESS",
  pickupCityId: "",
  scheduleDate: "",
  scheduleSlot: "",
};

function StepBar({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <div className="border-b border-divider">
      <div className="ins-container flex items-center gap-6 py-3.5 flex-wrap">
        <span className="font-semibold text-lg flex items-center gap-1.5">
          <Icon name="package" size={16} className="text-accent" />
          Send a package
        </span>
        <span className="text-[13px] text-neutral-700">Step {step + 1} of 5</span>
        <div className="flex gap-1 items-center ml-auto">
          {STEP_DEFS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => i <= step && onGo(i)}
              disabled={i > step}
              className={`flex items-center gap-1.5 text-[13px] px-2 py-1 border-x-0 border-t-0 border-b-2 bg-transparent ${
                i === step ? "border-accent" : "border-transparent"
              } ${i <= step ? "text-text cursor-pointer" : "text-neutral-500 cursor-default"}`}
            >
              <span className="font-semibold">{i + 1}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceSidebar({
  quote,
  loading,
  error,
  pickupAddress,
  destinationAddress,
}: {
  quote: QuoteResponse | null;
  loading: boolean;
  error: string | null;
  pickupAddress: string;
  destinationAddress: string;
}) {
  return (
    <aside className="p-6 rounded-xl border border-divider bg-card sticky top-6 flex flex-col gap-3.5">
      <div className="text-xl font-semibold">Price estimate</div>
      <div className="flex flex-col gap-0.5 text-sm py-3 border-t border-b border-divider">
        <div className="flex gap-2.5 items-center">
          <Icon name="pin" size={14} className="text-accent" />
          <span className="truncate">{pickupAddress || "Pickup address"}</span>
        </div>
        <div className="w-px h-3.5 bg-divider ml-[6px]" />
        <div className="flex gap-2.5 items-center">
          <Icon name="pin" size={14} className="text-accent-800" />
          <span className="truncate">
            {destinationAddress || "Destination address"}
            {quote ? ` · ${quote.distanceKm.toFixed(1)} km` : ""}
          </span>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-error m-0">{error}</p>
      ) : (
        quote?.breakdown.map((l) => (
          <div key={l.label} className="flex justify-between text-sm">
            <span className="text-neutral-700">{l.label}</span>
            <span>{fmtUsd(l.amount)}</span>
          </div>
        ))
      )}
      <div className="flex justify-between items-end pt-3 border-t border-divider">
        <span className="text-sm">Total</span>
        <span className="text-[40px] font-semibold leading-none">
          {loading ? "…" : fmtUsd(quote?.total ?? 0)}
        </span>
      </div>
      <div className="text-xs text-neutral-600 flex gap-1.5">
        <Icon name="shield" size={14} />
        Price is fixed once you book. No surge charges.
      </div>
    </aside>
  );
}

export default function LogisticsBookPage() {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState(false);
  const [bookError, setBookError] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState<Delivery | null>(null);
  const [pickupCities, setPickupCities] = React.useState<PickupCity[] | null>(null);
  const [pickupError, setPickupError] = React.useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  React.useEffect(() => {
    if (!form.pickupAddress.trim() || !form.destinationAddress.trim()) return;
    let cancelled = false;
    // Re-quoting from the server whenever speed/weight/insurance/addresses
    // change and flagging it as in-flight is a genuine
    // sync-with-external-system effect, not derivable render-time state.
    // Debounced since this now hits the real Mapbox-backed geocoding seam.
    const timer = setTimeout(() => {
      setQuoteLoading(true);
      setQuoteError(null);
      quoteDelivery({
        pickupAddress: form.pickupAddress,
        destinationAddress: form.destinationAddress,
        speed: form.speed,
        weightBand: form.weightBand,
        insured: form.insured,
      })
        .then((q) => !cancelled && setQuote(q))
        .catch((err) => {
          if (cancelled) return;
          setQuote(null);
          setQuoteError(
            err instanceof ApiError ? err.message : "Couldn't price this route. Check both addresses.",
          );
        })
        .finally(() => !cancelled && setQuoteLoading(false));
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pickupAddress, form.destinationAddress, form.speed, form.weightBand, form.insured]);

  // Scheduled pickups: the server lists each city's bookable slots, already
  // worked out in that city's time zone, so nothing here depends on the
  // visitor's own clock or zone. Re-fetched each time Scheduled is picked so
  // slots that have since started drop out.
  const scheduling = form.speed === "SCHEDULED";
  React.useEffect(() => {
    if (!scheduling) return;
    let cancelled = false;
    getPickupWindows()
      .then((res) => {
        if (cancelled) return;
        setPickupError(null);
        setPickupCities(res.cities);
      })
      .catch((err) => {
        if (cancelled) return;
        setPickupCities(null);
        setPickupError(err instanceof ApiError ? err.message : "Couldn't load pickup times. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [scheduling]);

  // Until the visitor picks, default to the one city the pickup address names
  // (or the only city on offer); date and window default to the first open.
  const pickupCity =
    pickupCities?.find((c) => c.id === form.pickupCityId) ??
    (pickupCities && !form.pickupCityId
      ? (cityInAddress(pickupCities, form.pickupAddress) ?? (pickupCities.length === 1 ? pickupCities[0] : undefined))
      : undefined);
  const scheduleDates = pickupCity
    ? [...new Map(pickupCity.slots.map((s) => [s.date, s.dateLabel])).entries()]
    : [];
  const scheduleDate = scheduleDates.some(([d]) => d === form.scheduleDate)
    ? form.scheduleDate
    : (scheduleDates[0]?.[0] ?? "");
  const dateSlots = pickupCity?.slots.filter((s) => s.date === scheduleDate) ?? [];
  const pickupSlot = dateSlots.find((s) => s.startsAt === form.scheduleSlot) ?? dateSlots[0];

  const canContinue = (() => {
    if (step === 0) return form.pickupAddress && form.pickupContact && form.pickupPhone;
    if (step === 1) return form.destinationAddress && form.destinationContact && form.destinationPhone;
    if (step === 3) return form.speed !== "SCHEDULED" || (!!pickupCity && !!pickupSlot);
    if (step === 4) return !!quote && !quoteError;
    return true;
  })();

  async function handleNext() {
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    setBooking(true);
    setBookError(null);
    try {
      const delivery = await createDelivery({
        pickupAddress: form.pickupAddress,
        destinationAddress: form.destinationAddress,
        speed: form.speed,
        weightBand: form.weightBand,
        insured: form.insured,
        pickupContact: form.pickupContact,
        pickupPhone: form.pickupPhone,
        destinationContact: form.destinationContact,
        destinationPhone: form.destinationPhone,
        packageDescription: form.packageDescription || PACKAGE_TYPES[form.packageTypeIdx].label,
        fragile: PACKAGE_TYPES[form.packageTypeIdx].fragile,
        notes: form.pickupNotes || undefined,
        // The slot's start exactly as the server listed it: a UTC instant for
        // the window's start in the city's own time zone.
        scheduledFor: form.speed === "SCHEDULED" ? pickupSlot?.startsAt : undefined,
        pickupCityId: form.speed === "SCHEDULED" ? pickupCity?.id : undefined,
      });
      setBooked(delivery);
      window.scrollTo(0, 0);
    } catch (err) {
      setBookError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  const sp = SPEEDS.find((s) => s.key === form.speed)!;

  if (booked) {
    return (
      <>
        <Header business="logistics" active="book" />
        <main className="flex-1 ins-container pt-14 pb-24">
          <div className="max-w-2xl mx-auto p-10 sm:p-12 rounded-xl border border-divider flex flex-col gap-4 items-start">
            <span className="size-12 rounded-[10px] bg-accent-100 text-accent-700 flex items-center justify-center">
              <Icon name="check" size={26} />
            </span>
            <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05]">Delivery booked</h1>
            <p className="text-base text-neutral-800 m-0">
              {booked.riderName ? `${booked.riderName} will pick it up. ` : ""}
              Share the tracking ID with {form.destinationContact} so they can follow it too.
            </p>
            <div className="grid grid-cols-3 w-full border border-divider rounded-lg">
              <div className="p-4 border-r border-divider">
                <div className="text-xs text-neutral-600">Tracking ID</div>
                <div className="text-2xl font-semibold">{booked.trackingId}</div>
              </div>
              <div className="p-4 border-r border-divider">
                <div className="text-xs text-neutral-600">Option</div>
                <div className="text-2xl font-semibold">{sp.name}</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-neutral-600">Price</div>
                <div className="text-2xl font-semibold">{fmtUsd(Number(booked.total))}</div>
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <LinkButton href={`/logistics/track?id=${booked.trackingId}`} variant="primary">
                Track delivery
              </LinkButton>
              <LinkButton href="/account/trips" variant="secondary">
                View in my account
              </LinkButton>
              <Button
                variant="ghost"
                onClick={() => {
                  setBooked(null);
                  setStep(0);
                  setForm(INITIAL_STATE);
                }}
              >
                Send another
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header business="logistics" active="book" />
      <StepBar step={step} onGo={setStep} />
      <main className="flex-1 ins-container pt-10 pb-24">
        <h1 className="text-[clamp(30px,4vw,48px)] leading-[1.05] mb-7">{STEP_TITLES[step]}</h1>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-9 items-start">
          <div className="p-7 sm:p-8 rounded-xl border border-divider flex flex-col gap-5">
            {step === 0 && (
              <>
                <Field label="Pickup address" required>
                  <AddressAutocomplete
                    value={form.pickupAddress}
                    onChange={(v) => set("pickupAddress", v)}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Contact person" required>
                    <Input value={form.pickupContact} onChange={(e) => set("pickupContact", e.target.value)} />
                  </Field>
                  <Field label="Phone" required>
                    <Input value={form.pickupPhone} onChange={(e) => set("pickupPhone", e.target.value)} />
                  </Field>
                </div>
                <Field label="Pickup notes" optional>
                  <Input
                    placeholder="Gate code, floor, landmark"
                    value={form.pickupNotes}
                    onChange={(e) => set("pickupNotes", e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Delivery address" required>
                  <AddressAutocomplete
                    value={form.destinationAddress}
                    onChange={(v) => set("destinationAddress", v)}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Recipient name" required>
                    <Input
                      value={form.destinationContact}
                      onChange={(e) => set("destinationContact", e.target.value)}
                    />
                  </Field>
                  <Field label="Recipient phone" required>
                    <Input
                      value={form.destinationPhone}
                      onChange={(e) => set("destinationPhone", e.target.value)}
                    />
                  </Field>
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendSms}
                    onChange={(e) => set("sendSms", e.target.checked)}
                  />
                  Send the recipient live tracking by SMS
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Package type" required>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PACKAGE_TYPES.map((p, i) => {
                      const selected = form.packageTypeIdx === i;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => set("packageTypeIdx", i)}
                          className={`p-3.5 rounded-xl border text-sm flex flex-col items-start gap-2 ${
                            selected
                              ? "border-accent bg-accent-100/40"
                              : "border-divider bg-transparent"
                          }`}
                        >
                          <Icon name={p.icon} size={20} />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Weight" required>
                    <Select
                      value={form.weightBand}
                      onChange={(e) => set("weightBand", e.target.value as WeightBandKey)}
                    >
                      {WEIGHT_BANDS.map((b) => (
                        <option key={b.key} value={b.key}>
                          {b.label}
                          {b.surcharge > 0 ? ` (+${fmtUsd(b.surcharge)})` : ""}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Size" required>
                    <Select value={form.packageSize} onChange={(e) => set("packageSize", e.target.value)}>
                      <option>Fits in a backpack</option>
                      <option>Fits in a car boot</option>
                      <option>Needs a van</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Description" optional>
                  <Input
                    value={form.packageDescription}
                    onChange={(e) => set("packageDescription", e.target.value)}
                  />
                </Field>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.insured}
                    onChange={(e) => set("insured", e.target.checked)}
                  />
                  Add cover up to $500 for {fmtUsd(1.2)}
                </label>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SPEEDS.map((o) => {
                    const selected = form.speed === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => set("speed", o.key)}
                        className={`p-4.5 rounded-xl border text-left flex flex-col gap-1.5 ${
                          selected ? "border-accent bg-accent-100/40" : "border-divider bg-transparent"
                        }`}
                      >
                        <span className="flex justify-between w-full items-center">
                          <span className="flex gap-2 items-center text-xl font-semibold">
                            <Icon name={o.icon} size={18} />
                            {o.name}
                          </span>
                          <span className="text-xl font-semibold">{fmtUsd(o.price)}</span>
                        </span>
                        <span className="text-sm text-neutral-700">{o.time}</span>
                      </button>
                    );
                  })}
                </div>
                {form.speed === "SCHEDULED" &&
                  (pickupError ? (
                    <p className="text-sm text-error m-0 mt-2">{pickupError}</p>
                  ) : !pickupCities ? (
                    <p className="text-sm text-neutral-700 m-0 mt-2">Loading pickup times…</p>
                  ) : pickupCities.length === 0 ? (
                    <p className="text-sm text-neutral-700 m-0 mt-2">
                      Scheduled pickups aren&apos;t open in any city right now. Choose another option.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4 mt-2">
                      <Field
                        label="Pickup city"
                        htmlFor="pickup-city"
                        required
                        hint={pickupCity ? `Times are ${pickupCity.name} time (${pickupCity.timezone})` : undefined}
                      >
                        <Select
                          id="pickup-city"
                          value={pickupCity?.id ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, pickupCityId: e.target.value, scheduleDate: "", scheduleSlot: "" }))
                          }
                        >
                          {!pickupCity && (
                            <option value="" disabled>
                              Choose a city
                            </option>
                          )}
                          {pickupCities.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field
                        label="Pickup date"
                        htmlFor="pickup-date"
                        required
                        error={pickupCity && scheduleDates.length === 0 ? "No pickup times left in this city" : undefined}
                      >
                        <Select
                          id="pickup-date"
                          value={scheduleDate}
                          disabled={scheduleDates.length === 0}
                          onChange={(e) => setForm((f) => ({ ...f, scheduleDate: e.target.value, scheduleSlot: "" }))}
                        >
                          {scheduleDates.map(([date, label]) => (
                            <option key={date} value={date}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Pickup window" htmlFor="pickup-window" required>
                        <Select
                          id="pickup-window"
                          value={pickupSlot?.startsAt ?? ""}
                          disabled={dateSlots.length === 0}
                          onChange={(e) => set("scheduleSlot", e.target.value)}
                        >
                          {dateSlots.map((slot) => (
                            <option key={slot.startsAt} value={slot.startsAt}>
                              {slot.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  ))}
              </>
            )}

            {step === 4 && (
              <>
                {[
                  { k: "Pickup", v: form.pickupAddress, sub: `${form.pickupContact} · ${form.pickupPhone}`, go: 0 },
                  { k: "Destination", v: form.destinationAddress, sub: `${form.destinationContact} · ${form.destinationPhone}`, go: 1 },
                  {
                    k: "Package",
                    v: PACKAGE_TYPES[form.packageTypeIdx].label,
                    sub:
                      WEIGHT_BANDS.find((b) => b.key === form.weightBand)!.label +
                      (form.insured ? " · covered to $500" : ""),
                    go: 2,
                  },
                  {
                    k: "Delivery",
                    v: sp.name,
                    sub:
                      form.speed === "SCHEDULED" && pickupSlot
                        ? `Pickup ${pickupSlot.dateLabel}, ${pickupSlot.label}`
                        : sp.time,
                    go: 3,
                  },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="grid grid-cols-[120px_minmax(0,1fr)_auto] sm:grid-cols-[140px_minmax(0,1fr)_auto] gap-4 pb-4 border-b border-divider"
                  >
                    <span className="text-[11px] tracking-[.12em] uppercase text-neutral-600 pt-0.5">
                      {r.k}
                    </span>
                    <div>
                      <div className="text-[15px] font-medium">{r.v}</div>
                      <div className="text-[13px] text-neutral-700">{r.sub}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(r.go)}
                      className="text-accent-700 text-sm bg-transparent border-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-baseline gap-4 pb-4 border-b border-divider">
                  <span className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Price</span>
                  <span className="text-[15px] font-medium">
                    {quoteLoading ? "…" : quote ? fmtUsd(quote.total) : "—"}
                  </span>
                </div>
                {bookError && <p className="text-sm text-error m-0">{bookError}</p>}
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <Icon name="back" size={14} /> Back
              </Button>
              <Button
                variant="primary"
                className="w-full sm:w-auto sm:min-w-[180px] h-10"
                disabled={!canContinue || booking}
                onClick={handleNext}
              >
                {booking
                  ? "Booking…"
                  : step === 4
                    ? `Book delivery · ${fmtUsd(quote?.total ?? 0)}`
                    : "Continue"}
              </Button>
            </div>
          </div>

          <PriceSidebar
            quote={quote}
            loading={quoteLoading}
            error={quoteError}
            pickupAddress={form.pickupAddress}
            destinationAddress={form.destinationAddress}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
