"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getTrips,
  addPassenger,
  type TripsResponse,
} from "@/lib/account";

const emptyForm = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  nationality: "",
  passportNumber: "",
  passportCountry: "",
  passportExpiry: "",
};

export default function TripsPage() {
  const [data, setData] = React.useState<TripsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    getTrips()
      .then(setData)
      .catch(() => setError("Couldn't load your trips."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading trips data from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleAddPassenger(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addPassenger(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
      toast("Passenger saved.", "success");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save passenger.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[920px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-24 h-7" />
          <Skeleton variant="text" className="w-96" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <SkeletonText lines={4} />
      </div>
    );
  }
  if (error || !data) {
    return <EmptyState icon="alert" title="Couldn't load your trips" description={error ?? "Something went wrong."} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[920px]">
      <PageHeader
        title="Trips"
        subtitle="Upcoming and past flights, travel documents, and saved passengers."
      />

      <div>
        <SectionKicker>Upcoming trip</SectionKicker>
        {data.upcoming ? (
          <Card>
            <CardKicker>
              {data.upcoming.flightNo} · {data.upcoming.aircraft}
            </CardKicker>
            <CardTitle>
              {data.upcoming.originCode} → {data.upcoming.destinationCode}
            </CardTitle>
            <CardBody>
              Departs {data.upcoming.outboundDate} at {data.upcoming.outboundDepart}
              {data.upcoming.returnDate ? ` · Returns ${data.upcoming.returnDate}` : ""}
            </CardBody>
            <LinkButton href="/travels" variant="secondary" className="self-start">
              View booking
            </LinkButton>
          </Card>
        ) : (
          <Card>
            <CardBody>No upcoming trips.</CardBody>
            <LinkButton href="/travels" variant="primary" className="self-start">
              Search flights
            </LinkButton>
          </Card>
        )}
      </div>

      <div>
        <SectionKicker>Past trips</SectionKicker>
        {data.past.length === 0 ? (
          <EmptyState icon="plane" title="No past trips yet" />
        ) : (
          <div className="flex flex-col gap-1">
            {data.past.map((t) => (
              <div
                key={t.bookingId}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg"
              >
                <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                  <Icon name="plane" size={16} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{t.route}</span>
                  <span className="block text-xs text-neutral-600">{t.date}</span>
                </span>
                <span className="text-sm font-medium">{t.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionKicker>Documents</SectionKicker>
        {data.documents.length === 0 ? (
          <EmptyState icon="file" title="No documents yet" />
        ) : (
          <div className="flex flex-col gap-1">
            {data.documents.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg"
              >
                <Icon name="file" size={16} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{d.name}</span>
                  <span className="block text-xs text-neutral-600">{d.meta}</span>
                </span>
                <Icon name="download" size={16} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <SectionKicker>Saved passengers</SectionKicker>
          <Button variant="ghost" onClick={() => setShowForm((v) => !v)}>
            <Icon name="plus" size={14} /> Add passenger
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddPassenger}
            className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4 mb-3"
          >
            {formError && <div className="text-sm text-error">{formError}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" required>
                <Input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </Field>
              <Field label="Last name" required>
                <Input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </Field>
              <Field label="Date of birth" required>
                <Input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </Field>
              <Field label="Gender" required>
                <Select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Nationality" required>
                <Input
                  required
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                />
              </Field>
              <Field label="Passport number" required>
                <Input
                  required
                  value={form.passportNumber}
                  onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                />
              </Field>
              <Field label="Passport country" required>
                <Input
                  required
                  value={form.passportCountry}
                  onChange={(e) => setForm({ ...form, passportCountry: e.target.value })}
                />
              </Field>
              <Field label="Passport expiry" required>
                <Input
                  type="date"
                  required
                  value={form.passportExpiry}
                  onChange={(e) => setForm({ ...form, passportExpiry: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save passenger"}
              </Button>
            </div>
          </form>
        )}

        {data.passengers.length === 0 ? (
          <EmptyState icon="user" title="No saved passengers yet" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.passengers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
                <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                  <Icon name="user" size={16} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="block text-xs text-neutral-600">
                    {p.nationality} · Passport {p.passportNumber}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.supportRequests.length > 0 && (
        <div>
          <SectionKicker>Related support requests</SectionKicker>
          <div className="flex flex-col gap-1">
            {data.supportRequests.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
                <Icon name="chat" size={16} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{s.subject}</span>
                  <span className="block text-xs text-neutral-600">{s.reference}</span>
                </span>
                <Tag variant="neutral">{s.status}</Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
