"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { ApiError } from "@/lib/api";
import { getSupportTickets, createSupportTicket, type SupportTicketSummary } from "@/lib/account";
import { useFieldErrors } from "@/lib/use-field-errors";

type TicketField = "subject" | "body";

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" | "info" {
  if (status === "RESOLVED" || status === "CLOSED") return status === "RESOLVED" ? "success" : "neutral";
  if (status === "AWAITING") return "warning";
  return "info";
}

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = React.useState<SupportTicketSummary[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ subject: "", category: "Delivery", body: "" });
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const { errors, setFieldError, validateAll } = useFieldErrors<TicketField>();

  const ticketValidators: Record<TicketField, () => string | undefined> = {
    subject: () => (form.subject.trim() ? undefined : "Subject is required"),
    body: () => (form.body.trim() ? undefined : "Message can't be empty"),
  };

  const load = React.useCallback(() => {
    setLoading(true);
    getSupportTickets()
      .then(setTickets)
      .catch(() => setError("Couldn't load support tickets."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading support tickets from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(ticketValidators)) return;
    setSaving(true);
    setFormError(null);
    try {
      const ticket = await createSupportTicket(form);
      setForm({ subject: "", category: "Delivery", body: "" });
      setShowForm(false);
      load();
      router.push(`/account/support/${ticket.id}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't create ticket.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[760px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-sm text-neutral-600 mt-1">Get help with deliveries, trips, or payments.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={14} /> New ticket
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4">
          {formError && <div className="text-sm text-error">{formError}</div>}
          <Field label="Subject" required error={errors.subject}>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              onBlur={() => setFieldError("subject", ticketValidators.subject())}
              invalid={!!errors.subject}
            />
          </Field>
          <Field label="Category" required>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Delivery</option>
              <option>Travel</option>
              <option>Payment</option>
              <option>Account</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Message" required error={errors.body}>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              onBlur={() => setFieldError("body", ticketValidators.body())}
            />
          </Field>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Submitting…" : "Submit ticket"}
            </Button>
          </div>
        </form>
      )}

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {!loading && !error && tickets && (
        <div className="flex flex-col gap-1">
          {tickets.length === 0 && (
            <div className="text-sm text-neutral-600 py-8 text-center">No support tickets yet.</div>
          )}
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/account/support/${t.id}`}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg no-underline text-text hover:border-neutral-300"
            >
              <Icon name="chat" size={16} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{t.subject}</span>
                <span className="block text-xs text-neutral-600">
                  {t.reference} · {t.category}
                </span>
              </span>
              <Tag variant={statusVariant(t.status)}>{t.status}</Tag>
              <Icon name="right" size={16} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
