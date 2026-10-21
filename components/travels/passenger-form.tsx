"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Radio } from "@/components/ui/radio";
import { ApiError } from "@/lib/api";
import { bookingHref, createBooking, fmtUsd, SPECIAL_REQUESTS, type FlightOffer, type PassengerInput } from "@/lib/travels";
import type { SavedPassenger } from "@/lib/account";
import { useFieldErrors } from "@/lib/use-field-errors";

interface PassengerFormState {
  savedPassengerId?: string;
  title: "Mr" | "Ms" | "Mx";
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female";
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
}

const BLANK_PASSENGER: PassengerFormState = {
  title: "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "Nigerian",
  passportNumber: "",
  passportCountry: "Nigeria",
  passportExpiry: "",
};

type FieldKey = `${number}.${"firstName" | "lastName" | "dob" | "passportNumber" | "passportExpiry"}`;
type ContactFieldKey = "contactEmail" | "contactPhone";

export function PassengerForm({
  offer,
  adults,
  savedPassengers,
}: {
  offer: FlightOffer;
  adults: number;
  savedPassengers: SavedPassenger[];
}) {
  const router = useRouter();
  const [passengers, setPassengers] = React.useState<PassengerFormState[]>(() =>
    Array.from({ length: adults }, () => ({ ...BLANK_PASSENGER })),
  );
  const [specialRequests, setSpecialRequests] = React.useState<string[]>([]);
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<FieldKey | ContactFieldKey>();

  function validatorsFor(i: number): Record<FieldKey, () => string | undefined> {
    const p = passengers[i];
    return {
      [`${i}.firstName`]: () => (p.firstName.trim() ? undefined : "First name is required"),
      [`${i}.lastName`]: () => (p.lastName.trim() ? undefined : "Last name is required"),
      [`${i}.dob`]: () => (p.dob ? undefined : "Date of birth is required"),
      [`${i}.passportNumber`]: () => (p.passportNumber.trim() ? undefined : "Passport number is required"),
      [`${i}.passportExpiry`]: () => (p.passportExpiry ? undefined : "Expiry date is required"),
    } as Record<FieldKey, () => string | undefined>;
  }

  const allValidators: Partial<Record<FieldKey | ContactFieldKey, () => string | undefined>> = {
    ...passengers.reduce((acc, _, i) => ({ ...acc, ...validatorsFor(i) }), {}),
    contactEmail: () => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()) ? undefined : "Enter a valid email address"),
    contactPhone: () => (contactPhone.trim() ? undefined : "Mobile number is required"),
  };

  function set<K extends keyof PassengerFormState>(i: number, key: K, value: PassengerFormState[K]) {
    setPassengers((ps) => ps.map((p, j) => (j === i ? { ...p, [key]: value } : p)));
  }

  function applySaved(i: number, p: SavedPassenger) {
    setPassengers((ps) =>
      ps.map((cur, j) =>
        j === i
          ? {
              ...cur,
              savedPassengerId: p.id,
              firstName: p.firstName,
              lastName: p.lastName,
              dob: p.dob,
              gender: p.gender === "Female" ? "Female" : "Male",
              nationality: p.nationality,
              passportNumber: p.passportNumber,
              passportCountry: p.passportCountry,
              passportExpiry: p.passportExpiry,
            }
          : cur,
      ),
    );
  }

  function toggleRequest(label: string) {
    setSpecialRequests((r) => (r.includes(label) ? r.filter((x) => x !== label) : [...r, label]));
  }

  const canSubmit = Boolean(
    passengers.every((p) => p.firstName && p.lastName && p.dob && p.passportNumber && p.passportExpiry) &&
      contactEmail &&
      contactPhone,
  );

  async function handleSubmit() {
    if (!validateAll(allValidators)) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        offerId: offer.id,
        passengers: passengers.map((p): PassengerInput => ({
          type: "ADULT",
          savedPassengerId: p.savedPassengerId,
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dob: p.dob,
          gender: p.gender,
          nationality: p.nationality,
          passportNumber: p.passportNumber,
          passportCountry: p.passportCountry,
          passportExpiry: p.passportExpiry,
        })),
        specialRequests,
        contactEmail,
        contactPhone,
      });
      router.push(bookingHref("payment", booking));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const firstLeg = offer.legs[0];
  const lastLeg = offer.legs[offer.legs.length - 1];

  return (
    <>
      <div className="flex flex-col gap-6 min-w-0">
        <div>
          <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0 mb-2">Who&apos;s travelling?</h1>
          <p className="text-sm text-neutral-700 m-0">
            Enter names exactly as they appear on the passport. Fields marked * are required.
          </p>
        </div>

        {passengers.map((p, i) => (
          <div key={i} className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4.5">
            <div className="text-xl font-semibold">Passenger {i + 1} · Adult</div>

            {savedPassengers.length > 0 && (
              <div className="flex gap-2.5 items-center p-3.5 border border-divider rounded-xl flex-wrap">
                <Icon name="users" size={16} className="text-accent" />
                <span className="text-sm mr-auto">Use a saved passenger</span>
                {savedPassengers.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => applySaved(i, sp)}
                    className="text-xs font-semibold px-2.5 py-[3px] rounded-full bg-neutral-200 hover:bg-accent-100 hover:text-accent-800 transition-colors cursor-pointer border-0"
                  >
                    {sp.firstName} {sp.lastName}
                  </button>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-[120px_repeat(2,minmax(0,1fr))] gap-4">
              <Field label="Title" required>
                <Select value={p.title} onChange={(e) => set(i, "title", e.target.value as PassengerFormState["title"])}>
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Mx</option>
                </Select>
              </Field>
              <Field label="First and middle names" required error={errors[`${i}.firstName`]}>
                <Input
                  value={p.firstName}
                  onChange={(e) => set(i, "firstName", e.target.value)}
                  onBlur={() => setFieldError(`${i}.firstName`, validatorsFor(i)[`${i}.firstName`]())}
                  invalid={!!errors[`${i}.firstName`]}
                />
              </Field>
              <Field label="Last name" required error={errors[`${i}.lastName`]}>
                <Input
                  value={p.lastName}
                  onChange={(e) => set(i, "lastName", e.target.value)}
                  onBlur={() => setFieldError(`${i}.lastName`, validatorsFor(i)[`${i}.lastName`]())}
                  invalid={!!errors[`${i}.lastName`]}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Date of birth" required error={errors[`${i}.dob`]}>
                <Input
                  type="date"
                  value={p.dob}
                  onChange={(e) => set(i, "dob", e.target.value)}
                  onBlur={() => setFieldError(`${i}.dob`, validatorsFor(i)[`${i}.dob`]())}
                  invalid={!!errors[`${i}.dob`]}
                />
              </Field>
              <Field label="Gender · as on passport" required>
                <div className="flex border border-neutral-300 rounded-md overflow-hidden h-[38px]">
                  {(["Male", "Female"] as const).map((g) => (
                    <label
                      key={g}
                      className={`flex-1 flex items-center justify-center gap-2 text-sm cursor-pointer ${
                        p.gender === g ? "bg-accent-100 text-accent-800" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`gender-${i}`}
                        className="sr-only"
                        checked={p.gender === g}
                        onChange={() => set(i, "gender", g)}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Nationality" required>
                <Select value={p.nationality} onChange={(e) => set(i, "nationality", e.target.value)}>
                  <option>Nigerian</option>
                  <option>Ghanaian</option>
                  <option>Kenyan</option>
                </Select>
              </Field>
            </div>

            <div className="pt-4 border-t border-divider flex flex-col gap-3.5">
              <span className="text-sm font-medium">Passport · required for international flights</span>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Passport number" required error={errors[`${i}.passportNumber`]}>
                  <Input
                    value={p.passportNumber}
                    onChange={(e) => set(i, "passportNumber", e.target.value)}
                    onBlur={() => setFieldError(`${i}.passportNumber`, validatorsFor(i)[`${i}.passportNumber`]())}
                    invalid={!!errors[`${i}.passportNumber`]}
                  />
                </Field>
                <Field label="Issuing country" required>
                  <Select value={p.passportCountry} onChange={(e) => set(i, "passportCountry", e.target.value)}>
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>Kenya</option>
                  </Select>
                </Field>
                <Field label="Expiry date" required error={errors[`${i}.passportExpiry`]}>
                  <Input
                    type="date"
                    value={p.passportExpiry}
                    onChange={(e) => set(i, "passportExpiry", e.target.value)}
                    onBlur={() => setFieldError(`${i}.passportExpiry`, validatorsFor(i)[`${i}.passportExpiry`]())}
                    invalid={!!errors[`${i}.passportExpiry`]}
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}

        <div className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4">
          <span className="text-sm font-medium">Special requests · optional</span>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_REQUESTS.map((r) => (
              <Radio
                key={r}
                square
                checked={specialRequests.includes(r)}
                onChange={() => toggleRequest(r)}
                className="border border-divider px-3 py-2 text-[13px] rounded-xl"
              >
                {r}
              </Radio>
            ))}
          </div>
        </div>

        <div className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4">
          <div className="text-xl font-semibold">Contact details</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" required error={errors.contactEmail}>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                onBlur={() => setFieldError("contactEmail", allValidators.contactEmail!())}
                invalid={!!errors.contactEmail}
              />
            </Field>
            <Field label="Mobile" required error={errors.contactPhone}>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                onBlur={() => setFieldError("contactPhone", allValidators.contactPhone!())}
                invalid={!!errors.contactPhone}
              />
            </Field>
          </div>
        </div>

        {error && <p className="text-sm text-error m-0">{error}</p>}
      </div>

      <aside className="p-6 border border-divider rounded-xl bg-card sticky top-6 flex flex-col gap-3">
        <span className="text-xl font-semibold">Your trip</span>
        {offer.legs.map((leg) => (
          <div key={leg.id} className="text-sm">
            <strong>{leg.flightNo}</strong> · {leg.date} · {leg.originCode} {leg.depart} → {leg.destinationCode} {leg.arrive}
          </div>
        ))}
        <div className="text-sm text-neutral-700">
          {firstLeg.originCity} → {lastLeg.destinationCity} · {passengers.length} adult{passengers.length > 1 ? "s" : ""}
        </div>
        <div className="flex justify-between items-end pt-3 border-t border-divider">
          <span className="text-sm">Total</span>
          <span className="text-[36px] font-semibold leading-none">{fmtUsd(offer.price)}</span>
        </div>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className="h-11 text-base inline-flex items-center justify-center gap-[7px] whitespace-nowrap font-semibold rounded-[0.4rem] bg-accent hover:bg-accent-700 text-white border-0 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "Booking…" : "Continue to payment"}
        </button>
        <LinkButton href={`/travels/detail?offer=${offer.id}&adults=${passengers.length}`} variant="ghost">
          Back
        </LinkButton>
      </aside>
    </>
  );
}
