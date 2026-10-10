"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { SectionKicker } from "@/components/ui/section-kicker";
import { ApiError } from "@/lib/api";
import { getProfile, updateProfile, revokeSession, type ProfileResponse } from "@/lib/account";
import { useFieldErrors } from "@/lib/use-field-errors";

type ProfileField = "firstName" | "lastName";

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<ProfileResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    defaultAddress: "",
    currency: "USD",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const { errors, setFieldError, validateAll } = useFieldErrors<ProfileField>();

  const validators: Record<ProfileField, () => string | undefined> = {
    firstName: () => (form.firstName.trim() ? undefined : "First name is required"),
    lastName: () => (form.lastName.trim() ? undefined : "Last name is required"),
  };

  const load = React.useCallback(() => {
    setLoading(true);
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone ?? "",
          defaultAddress: p.defaultAddress ?? "",
          currency: p.currency,
        });
      })
      .catch(() => setError("Couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading the profile from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(validators)) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      load();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Couldn't save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(id: string) {
    await revokeSession(id);
    load();
  }

  if (loading) return <div className="text-sm text-neutral-600">Loading profile…</div>;
  if (error || !profile) return <div className="text-sm text-error">{error ?? "Something went wrong."}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-neutral-600 mt-1">Manage your personal details and sessions.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4">
        {saveError && <div className="text-sm text-error">{saveError}</div>}
        {saved && <div className="text-sm text-success">Profile updated.</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" required error={errors.firstName}>
            <Input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              onBlur={() => setFieldError("firstName", validators.firstName())}
              invalid={!!errors.firstName}
            />
          </Field>
          <Field label="Last name" required error={errors.lastName}>
            <Input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              onBlur={() => setFieldError("lastName", validators.lastName())}
              invalid={!!errors.lastName}
            />
          </Field>
        </div>
        <Field label="Email">
          <Input value={profile.email} disabled />
        </Field>
        <Field label="Phone" optional>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Default address" optional>
          <Input
            value={form.defaultAddress}
            onChange={(e) => setForm({ ...form, defaultAddress: e.target.value })}
          />
        </Field>
        <Field label="Currency" required>
          <Select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="NGN">NGN</option>
          </Select>
        </Field>
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div>
        <SectionKicker>Active sessions</SectionKicker>
        <div className="flex flex-col gap-1">
          {profile.sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
              <Icon name="shield" size={16} />
              <span className="flex-1">
                <span className="block text-sm font-medium">Session</span>
                <span className="block text-xs text-neutral-600">
                  Created {new Date(s.createdAt).toLocaleString()} · Expires{" "}
                  {new Date(s.expiresAt).toLocaleString()}
                </span>
              </span>
              <Button variant="secondary" onClick={() => handleRevoke(s.id)}>
                Revoke
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
