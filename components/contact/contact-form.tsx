"use client";

import * as React from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import { useFieldErrors } from "@/lib/use-field-errors";
import { submitContactMessage, type ContactTopic } from "@/lib/contact";
import { useAuth } from "@/lib/auth-context";

type Status = "idle" | "submitting" | "success" | "error";
type FormField = "name" | "email" | "subject" | "message";

const TOPIC_LABELS: Record<ContactTopic, string> = {
  SUPPORT: "Support",
  SALES: "Sales",
  GENERAL: "General inquiry",
  PRESS: "Press",
};

export function ContactForm({
  defaultTopic,
  allowTopicChange = true,
  submitLabel = "Send message",
}: {
  defaultTopic: ContactTopic;
  allowTopicChange?: boolean;
  submitLabel?: string;
}) {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState<ContactTopic>(defaultTopic);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const { errors, setFieldError, validateAll } = useFieldErrors<FormField>();

  React.useEffect(() => {
    if (!user) return;
    setName((prev) => prev || `${user.firstName} ${user.lastName}`.trim());
    setEmail((prev) => prev || user.email);
  }, [user]);

  const validators: Record<FormField, () => string | undefined> = {
    name: () => (name.trim() ? undefined : "Your name is required"),
    email: () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : "Enter a valid email",
    subject: () => (subject.trim() ? undefined : "Give it a short subject"),
    message: () =>
      message.trim().length >= 10 ? undefined : "Tell us a bit more (min 10 characters)",
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setStatus("submitting");
    setError(null);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        topic,
        subject: subject.trim(),
        message: message.trim(),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center py-10">
        <span className="flex items-center justify-center size-12 rounded-full bg-accent-100 text-accent-700">
          <Icon name="check" size={24} />
        </span>
        <div className="text-xl font-semibold">Message sent.</div>
        <p className="text-sm text-neutral-700 max-w-sm m-0">
          We&apos;ve got it &mdash; our team replies within one business day, by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Your name" required error={errors.name}>
        <Input
          placeholder="Ada Okafor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setFieldError("name", validators.name())}
          invalid={!!errors.name}
        />
      </Field>
      <Field label="Email" required error={errors.email}>
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setFieldError("email", validators.email())}
          invalid={!!errors.email}
        />
      </Field>
      {allowTopicChange && (
        <Field label="Topic" required className="sm:col-span-2">
          <Select value={topic} onChange={(e) => setTopic(e.target.value as ContactTopic)}>
            {Object.entries(TOPIC_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Subject" required error={errors.subject} className="sm:col-span-2">
        <Input
          placeholder="What's this about?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onBlur={() => setFieldError("subject", validators.subject())}
          invalid={!!errors.subject}
        />
      </Field>
      <Field label="Message" required error={errors.message} className="sm:col-span-2">
        <Textarea
          placeholder="Tell us what's going on..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setFieldError("message", validators.message())}
          invalid={!!errors.message}
        />
      </Field>

      {status === "error" && <p className="sm:col-span-2 text-sm text-error m-0">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        className="sm:col-span-2 h-10"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
