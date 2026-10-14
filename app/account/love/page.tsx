"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getMyProfile,
  updateProfile,
  getMatches,
  ageFromBirthdate,
  type DatingProfile,
  type MatchRow,
  type Gender,
  type InterestedIn,
} from "@/lib/dating";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AccountLovePage() {
  const [profile, setProfile] = React.useState<DatingProfile | null | undefined>(undefined);
  const [matches, setMatches] = React.useState<MatchRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState<{ displayName: string; bio: string; city: string; gender: Gender; interestedIn: InterestedIn }>({
    displayName: "",
    bio: "",
    city: "",
    gender: "female",
    interestedIn: "everyone",
  });
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([getMyProfile(), getMatches()])
      .then(([p, m]) => {
        setProfile(p);
        setMatches(m);
        if (p) {
          setForm({ displayName: p.displayName, bio: p.bio, city: p.city, gender: p.gender, interestedIn: p.interestedIn });
        }
      })
      .catch(() => setError("Couldn't load your Love account."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading profile/matches from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    updateProfile(form)
      .then((p) => {
        setProfile(p);
        toast("Profile updated.", "success");
      })
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't save changes.", "error"))
      .finally(() => setBusy(false));
  }

  function toggleActive() {
    if (!profile) return;
    setBusy(true);
    updateProfile({ isActive: !profile.isActive })
      .then((p) => {
        setProfile(p);
        toast(p.isActive ? "Your profile is visible again." : "Your profile is hidden from Discover.", "success");
      })
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't update visibility.", "error"))
      .finally(() => setBusy(false));
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[720px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-40 h-7" />
          <Skeleton variant="text" className="w-80" />
        </div>
        <Skeleton className="h-28 w-full rounded-lg" />
        <SkeletonText lines={4} />
      </div>
    );
  }
  if (error) {
    return <EmptyState icon="alert" title="Couldn't load Love" description={error} />;
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 max-w-[720px]">
        <PageHeader title="Love" subtitle="Meet someone new on Instanta." />
        <EmptyState
          icon="heart"
          title="No profile yet"
          description="Create your profile to start discovering people."
          action={<LinkButton href="/love/discover" variant="primary">Create profile</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <PageHeader title="Love" subtitle="Manage your profile and see your matches." />

      <div>
        <SectionKicker>Your profile</SectionKicker>
        <Card className="gap-4">
          <div className="flex items-center gap-3">
            <span className="size-14 shrink-0 grid place-items-center bg-accent-100 text-accent-700 rounded-full text-lg font-semibold">
              {initials(profile.displayName)}
            </span>
            <div>
              <CardTitle>
                {profile.displayName}, {ageFromBirthdate(profile.birthdate)}
              </CardTitle>
              <div className="text-sm text-neutral-600">{profile.city}</div>
            </div>
            <Button variant="secondary" className="ml-auto" disabled={busy} onClick={toggleActive}>
              {profile.isActive ? "Hide from Discover" : "Show in Discover"}
            </Button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3 pt-2 border-t border-divider">
            <Field label="Name">
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="Interested in">
                <Select
                  value={form.interestedIn}
                  onChange={(e) => setForm({ ...form, interestedIn: e.target.value as InterestedIn })}
                >
                  <option value="everyone">Everyone</option>
                  <option value="female">Women</option>
                  <option value="male">Men</option>
                </Select>
              </Field>
            </div>
            <Field label="About you">
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
            <Button type="submit" disabled={busy} className="self-end">
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionKicker>Recent matches</SectionKicker>
          <Link href="/love/matches" className="text-sm text-accent-700 no-underline font-medium">
            View all →
          </Link>
        </div>
        {!matches || matches.length === 0 ? (
          <EmptyState icon="heart" title="No matches yet" description="Discover people to start matching." />
        ) : (
          <div className="flex flex-col gap-2">
            {matches.slice(0, 5).map((m) => (
              <Link
                key={m.id}
                href={`/love/matches/${m.id}`}
                className="flex items-center gap-3 p-3 bg-card border border-divider rounded-lg no-underline text-text hover:border-neutral-300 transition-colors duration-150"
              >
                <span className="size-10 shrink-0 grid place-items-center bg-accent-100 text-accent-700 rounded-full font-semibold text-sm">
                  {m.otherUser ? initials(m.otherUser.displayName) : <Icon name="user" size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{m.otherUser?.displayName ?? "Instanta user"}</div>
                  <div className="text-xs text-neutral-600 truncate">
                    {m.lastMessage ? m.lastMessage.body : "Say hello — you matched!"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
