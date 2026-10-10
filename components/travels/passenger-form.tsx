"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Radio } from "@/components/ui/radio";
import { ApiError } from "@/lib/api";
import { createBooking, fmtUsd, SPECIAL_REQUESTS, type FlightOffer } from "@/lib/travels";
import { useFieldErrors } from "@/lib/use-field-errors";

const SAVED_PASSENGERS = [
  {
    title: "Mr" as const,
    firstName: "Divine",
    lastName: "Okafor",
    dob: "1991-03-14",
    gender: "Male" as const,
    nationality: "Nigerian",
    passportNumber: "A01234582",
    passportCountry: "Nigeria",
    passportExpiry: "2031-09-01",
  },
  {
    title: "Ms" as const,
    firstName: "Ada",
    lastName: "Okafor",
    dob: "1994-07-22",
    gender: "Female" as const,
    nationality: "Nigerian",
    passportNumber: "A09876543",
    passportCountry: "Nigeria",
    passportExpiry: "2029-02-15",
  },
];

interface FormState {
  title: "Mr" | "Ms" | "Mx";
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female";
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  specialRequests: string[];
  contactEmail: string;
  contactPhone: string;
}

const INITIAL_STATE: FormState = {
  title: "Mr",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "Nigerian",
  passportNumber: "",
  passportCountry: "Nigeria",
  passportExpiry: "",
  specialRequests: [],
  contactEmail: "",
  contactPhone: "",
};

type PassengerField =
  | "firstName"
  | "lastName"
  | "dob"
  | "passportNumber"
  | "passportExpiry"
  | "contactEmail"
  | "contactPhone";

export function PassengerForm({ offer }: { offer: FlightOffer }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<PassengerField>();

  const validators: Record<PassengerField, () => string | undefined> = {
    firstName: () => (form.firstName.trim() ? undefined : "First name is required"),
    lastName: () => (form.lastName.trim() ? undefined : "Last name is required"),
    dob: () => (form.dob ? undefined : "Date of birth is required"),
    passportNumber: () => (form.passportNumber.trim() ? undefined : "Passport number is required"),
    passportExpiry: () => (form.passportExpiry ? undefined : "Expiry date is required"),
    contactEmail: () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim()) ? undefined : "Enter a valid email address",
    contactPhone: () => (form.contactPhone.trim() ? undefined : "Mobile number is required"),
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applySaved(p: (typeof SAVED_PASSENGERS)[number]) {
    setForm((f) => ({
      ...f,
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      gender: p.gender,
      nationality: p.nationality,
      passportNumber: p.passportNumber,
      passportCountry: p.passportCountry,
      passportExpiry: p.passportExpiry,
    }));
  }

  function toggleRequest(label: string) {
    setForm((f) => ({
      ...f,
      specialRequests: f.specialRequests.includes(label)
        ? f.specialRequests.filter((r) => r !== label)
        : [...f.specialRequests, label],
    }));
  }

  const canSubmit = Boolean(
    form.firstName &&
      form.lastName &&
      form.dob &&
      form.passportNumber &&
      form.passportExpiry &&
      form.contactEmail &&
      form.contactPhone,
  );

  async function handleSubmit() {
    if (!validateAll(validators)) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        offerId: offer.id,
        adults: 1,
        passenger: {
          title: form.title,
          firstName: form.firstName,
          lastName: form.lastName,
          dob: form.dob,
          gender: form.gender,
          nationality: form.nationality,
          passportNumber: form.passportNumber,
          passportCountry: form.passportCountry,
          passportExpiry: form.passportExpiry,
        },
        specialRequests: form.specialRequests,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
      });
      router.push(`/travels/payment?booking=${booking.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 min-w-0">
        <div>
          <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0 mb-2">Who&apos;s travelling?</h1>
          <p className="text-sm text-neutral-700 m-0">
            Enter names exactly as they appear on the passport. Fields marked * are required.
          </p>
        </div>

        <div className="flex gap-2.5 items-center p-3.5 border border-divider rounded-xl flex-wrap">
          <Icon name="users" size={16} className="text-accent" />
          <span className="text-sm mr-auto">Use a saved passenger</span>
          {SAVED_PASSENGERS.map((p) => (
            <button
              key={p.passportNumber}
              type="button"
              onClick={() => applySaved(p)}
              className="text-xs font-semibold px-2.5 py-[3px] rounded-full bg-neutral-200 hover:bg-accent-100 hover:text-accent-800 transition-colors cursor-pointer border-0"
            >
              {p.firstName} {p.lastName}
            </button>
          ))}
        </div>

        <div className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4.5">
          <div className="text-xl font-semibold">Passenger 1 · Adult</div>
          <div className="grid sm:grid-cols-[120px_repeat(2,minmax(0,1fr))] gap-4">
            <Field label="Title" required>
              <Select value={form.title} onChange={(e) => set("title", e.target.value as FormState["title"])}>
                <option>Mr</option>
                <option>Ms</option>
                <option>Mx</option>
              </Select>
            </Field>
            <Field label="First and middle names" required error={errors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                onBlur={() => setFieldError("firstName", validators.firstName())}
                invalid={!!errors.firstName}
              />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                onBlur={() => setFieldError("lastName", validators.lastName())}
                invalid={!!errors.lastName}
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Date of birth" required error={errors.dob}>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                onBlur={() => setFieldError("dob", validators.dob())}
                invalid={!!errors.dob}
              />
            </Field>
            <Field label="Gender · as on passport" required>
              <div className="flex border border-neutral-300 rounded-md overflow-hidden h-[38px]">
                {(["Male", "Female"] as const).map((g) => (
                  <label
                    key={g}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm cursor-pointer ${
                      form.gender === g ? "bg-accent-100 text-accent-800" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      className="sr-only"
                      checked={form.gender === g}
                      onChange={() => set("gender", g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Nationality" required>
              <Select value={form.nationality} onChange={(e) => set("nationality", e.target.value)}>
                <option>Nigerian</option>
                <option>Ghanaian</option>
                <option>Kenyan</option>
              </Select>
            </Field>
          </div>

          <div className="pt-4 border-t border-divider flex flex-col gap-3.5">
            <span className="text-sm font-medium">Passport · required for international flights</span>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Passport number" required error={errors.passportNumber}>
                <Input
                  value={form.passportNumber}
                  onChange={(e) => set("passportNumber", e.target.value)}
                  onBlur={() => setFieldError("passportNumber", validators.passportNumber())}
                  invalid={!!errors.passportNumber}
                />
              </Field>
              <Field label="Issuing country" required>
                <Select value={form.passportCountry} onChange={(e) => set("passportCountry", e.target.value)}>
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>Kenya</option>
                </Select>
              </Field>
              <Field label="Expiry date" required error={errors.passportExpiry}>
                <Input
                  type="date"
                  value={form.passportExpiry}
                  onChange={(e) => set("passportExpiry", e.target.value)}
                  onBlur={() => setFieldError("passportExpiry", validators.passportExpiry())}
                  invalid={!!errors.passportExpiry}
                />
              </Field>
            </div>
          </div>

          <div className="pt-4 border-t border-divider flex flex-col gap-3">
            <span className="text-sm font-medium">Special requests · optional</span>
            <div className="flex flex-wrap gap-2">
              {SPECIAL_REQUESTS.map((r) => (
                <Radio
                  key={r}
                  square
                  checked={form.specialRequests.includes(r)}
                  onChange={() => toggleRequest(r)}
                  className="border border-divider px-3 py-2 text-[13px] rounded-xl"
                >
                  {r}
                </Radio>
              ))}
            </div>
          </div>
        </div>

        <div className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4">
          <div className="text-xl font-semibold">Contact details</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" required error={errors.contactEmail}>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                onBlur={() => setFieldError("contactEmail", validators.contactEmail())}
                invalid={!!errors.contactEmail}
              />
            </Field>
            <Field label="Mobile" required error={errors.contactPhone}>
              <Input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                onBlur={() => setFieldError("contactPhone", validators.contactPhone())}
                invalid={!!errors.contactPhone}
              />
            </Field>
          </div>
        </div>

        {error && <p className="text-sm text-error m-0">{error}</p>}
      </div>

      <aside className="p-6 border border-divider rounded-xl bg-card sticky top-6 flex flex-col gap-3">
        <span className="text-xl font-semibold">Your trip</span>
        <div className="text-sm">
          <strong>{offer.outboundFlightNo}</strong> · {offer.outboundDate} · {offer.originCode} {offer.outboundDepart} → {offer.destinationCode} {offer.outboundArrive}
        </div>
        <div className="text-sm">
          <strong>{offer.returnFlightNo}</strong> · {offer.returnDate} · {offer.destinationCode} {offer.returnDepart} → {offer.originCode} {offer.returnArrive}
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
        <LinkButton href={`/travels/detail?offer=${offer.id}`} variant="ghost">
          Back
        </LinkButton>
      </aside>
    </>
  );
}
