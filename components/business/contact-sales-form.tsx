"use client";

import * as React from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { apiFetch, ApiError } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactSalesForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          companyName: form.get("companyName"),
          workEmail: form.get("workEmail"),
          teamSize: form.get("teamSize"),
          interest: form.get("interest"),
        }),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center py-10">
        <span className="flex items-center justify-center size-12 rounded-full bg-accent-100 text-accent-700">
          <Icon name="check" size={24} />
        </span>
        <div className="text-xl font-semibold">Thanks — we&apos;ll be in touch.</div>
        <p className="text-sm text-neutral-700 max-w-sm m-0">
          Our business team replies within one business day with next steps
          for setting up your workspace.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid sm:grid-cols-2 gap-4"
    >
      <Field label="Company name" required>
        <Input name="companyName" placeholder="Acme Foods Ltd" required />
      </Field>
      <Field label="Work email" required>
        <Input
          type="email"
          name="workEmail"
          placeholder="ops@acmefoods.com"
          required
        />
      </Field>
      <Field label="Team size" required>
        <Select name="teamSize" required defaultValue="">
          <option value="" disabled>
            Select team size
          </option>
          <option value="1-10 people">1–10 people</option>
          <option value="11-50 people">11–50 people</option>
          <option value="51-200 people">51–200 people</option>
          <option value="200+ people">200+ people</option>
        </Select>
      </Field>
      <Field label="Interested in" required>
        <Select name="interest" required defaultValue="LOGISTICS_AND_TRAVEL">
          <option value="LOGISTICS_AND_TRAVEL">Logistics and travel</option>
          <option value="LOGISTICS_ONLY">Logistics only</option>
          <option value="TRAVEL_ONLY">Travel only</option>
        </Select>
      </Field>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-error m-0">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        className="sm:col-span-2 h-10"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Request a call back"}
      </Button>
    </form>
  );
}
