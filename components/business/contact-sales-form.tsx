"use client";

import * as React from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { apiFetch, ApiError } from "@/lib/api";
import { useFieldErrors } from "@/lib/use-field-errors";

type Status = "idle" | "submitting" | "success" | "error";
type LeadField = "companyName" | "workEmail" | "teamSize";

export function ContactSalesForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [companyName, setCompanyName] = React.useState("");
  const [workEmail, setWorkEmail] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");
  const [interest, setInterest] = React.useState("LOGISTICS_AND_TRAVEL");
  const { errors, setFieldError, validateAll } = useFieldErrors<LeadField>();

  const validators: Record<LeadField, () => string | undefined> = {
    companyName: () => (companyName.trim() ? undefined : "Company name is required"),
    workEmail: () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim()) ? undefined : "Enter a valid work email",
    teamSize: () => (teamSize ? undefined : "Select a team size"),
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setStatus("submitting");
    setError(null);

    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({ companyName, workEmail, teamSize, interest }),
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
        <div className="text-xl font-semibold">Thanks, we&apos;ll be in touch.</div>
        <p className="text-sm text-neutral-700 max-w-sm m-0">
          Our business team will reply by email with next steps
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
      <Field label="Company name" required error={errors.companyName}>
        <Input
          placeholder="Acme Foods Ltd"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onBlur={() => setFieldError("companyName", validators.companyName())}
          invalid={!!errors.companyName}
        />
      </Field>
      <Field label="Work email" required error={errors.workEmail}>
        <Input
          type="email"
          placeholder="ops@acmefoods.com"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          onBlur={() => setFieldError("workEmail", validators.workEmail())}
          invalid={!!errors.workEmail}
        />
      </Field>
      <Field label="Team size" required error={errors.teamSize}>
        <Select
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          onBlur={() => setFieldError("teamSize", validators.teamSize())}
        >
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
        <Select value={interest} onChange={(e) => setInterest(e.target.value)}>
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
