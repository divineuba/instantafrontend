"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import { SwipeDeck } from "@/components/love/swipe-deck";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  getMyProfile,
  createProfile,
  discover,
  swipe,
  type DatingProfile,
  type Gender,
  type InterestedIn,
} from "@/lib/dating";

function CreateProfileForm({ onCreated }: { onCreated: (p: DatingProfile) => void }) {
  const [form, setForm] = React.useState({
    displayName: "",
    bio: "",
    birthdate: "",
    gender: "female" as Gender,
    interestedIn: "everyone" as InterestedIn,
    city: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <Card className="items-start gap-3 max-w-[480px] mx-auto">
      <Tag variant="accent">One-time setup</Tag>
      <CardTitle>Create your profile</CardTitle>
      <p className="text-sm text-neutral-700 m-0">
        This is what other people see when you come up in their feed.
      </p>
      <form
        className="flex flex-col gap-3 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.displayName.trim() || !form.bio.trim() || !form.birthdate || !form.city.trim()) {
            setError("Fill in every field.");
            return;
          }
          setBusy(true);
          setError(null);
          createProfile(form)
            .then(onCreated)
            .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't save your profile."))
            .finally(() => setBusy(false));
        }}
      >
        {error && <div className="text-sm text-error">{error}</div>}
        <Field label="Name">
          <Input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="How you'd like to be seen"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Birthdate">
            <Input
              type="date"
              value={form.birthdate}
              onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            />
          </Field>
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Lagos"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="I am">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
              <option value="female">Woman</option>
              <option value="male">Man</option>
              <option value="other">Other</option>
            </Select>
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
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A couple of lines about you"
          />
        </Field>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Create profile"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoveDiscoverPage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = React.useState<DatingProfile | null | undefined>(undefined);
  const [feed, setFeed] = React.useState<DatingProfile[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [match, setMatch] = React.useState<{ name: string; matchId: string } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    getMyProfile().then(setProfile);
  }, [user]);

  React.useEffect(() => {
    if (!profile) return;
    discover().then(setFeed);
  }, [profile]);

  function handleSwipe(target: DatingProfile, direction: "LIKE" | "PASS") {
    setBusy(true);
    setError(null);
    swipe(target.userId, direction)
      .then((result) => {
        setFeed((f) => (f ? f.filter((p) => p.userId !== target.userId) : f));
        if (result.matched) {
          setMatch({ name: target.displayName, matchId: result.matchId });
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "That didn't go through."))
      .finally(() => setBusy(false));
  }

  return (
    <>
      <Header business="love" active="discover" />
      <main className="flex-1">
        <div className="ins-container py-12 flex flex-col gap-6 items-center">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-3xl font-semibold">Discover</h1>
            <p className="text-neutral-700 m-0">Like someone back and you&apos;re instantly matched.</p>
          </div>

          {!authLoading && !user ? (
            <Card className="items-start gap-3 max-w-[420px]">
              <Tag variant="accent">Sign in required</Tag>
              <CardTitle>Sign in to start matching</CardTitle>
              <p className="text-sm text-neutral-700 m-0">
                Create an account or sign in to build a profile and discover people.
              </p>
              <LinkButton href={`/login?next=${encodeURIComponent(pathname ?? "/love/discover")}`} variant="primary">
                Sign in
              </LinkButton>
            </Card>
          ) : profile === undefined ? (
            <Skeleton className="h-28 w-full max-w-[420px] rounded-lg" />
          ) : profile === null ? (
            <CreateProfileForm onCreated={setProfile} />
          ) : (
            <>
              {error && <div className="text-sm text-error">{error}</div>}
              {!feed ? (
                <Skeleton className="h-[420px] w-full max-w-[380px] rounded-2xl" />
              ) : (
                <SwipeDeck profiles={feed} busy={busy} onSwipe={handleSwipe} />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      <Modal open={match != null} onClose={() => setMatch(null)}>
        <ModalHeader title="It's a match!" onClose={() => setMatch(null)} />
        <ModalBody>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="size-16 grid place-items-center bg-accent-100 text-accent-700 rounded-full">
              <Icon name="heart" size={28} />
            </span>
            <p className="m-0">
              You and <span className="font-semibold">{match?.name}</span> liked each other.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setMatch(null)}>
            Keep discovering
          </Button>
          <Button
            onClick={() => {
              if (match) router.push(`/love/matches/${match.matchId}`);
            }}
          >
            Send a message
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
