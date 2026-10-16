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
import { getDatingSocket, type MatchNewEvent } from "@/lib/dating-socket";
import {
  getMyProfile,
  createProfile,
  discover,
  swipe,
  type DatingProfile,
  type Gender,
  type InterestedIn,
  type SwipeDirection,
} from "@/lib/dating";

const LOW_FEED_THRESHOLD = 4;

function CreateProfileForm({ onCreated }: { onCreated: (p: DatingProfile) => void }) {
  const [form, setForm] = React.useState({
    displayName: "",
    bio: "",
    birthdate: "",
    gender: "female" as Gender,
    interestedIn: "everyone" as InterestedIn,
    city: "",
    interests: "",
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
          const interests = form.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
            .slice(0, 10);
          createProfile({ ...form, interests })
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
        <Field label="Interests (comma separated)">
          <Input
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            placeholder="hiking, jazz, cooking"
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
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [superlikesRemaining, setSuperlikesRemaining] = React.useState(0);
  const [match, setMatch] = React.useState<{ name: string; matchId: string } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    getMyProfile().then(setProfile);
  }, [user]);

  React.useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuperlikesRemaining(profile.superlikesRemaining);
    discover().then((result) => {
      setFeed(result.profiles);
      setNextCursor(result.nextCursor);
    });
  }, [profile]);

  React.useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const socket = getDatingSocket();
    function onMatchNew(event: MatchNewEvent) {
      const otherUserId = event.userAId === userId ? event.userBId : event.userAId;
      setFeed((f) => (f ? f.filter((p) => p.userId !== otherUserId) : f));
      setMatch({ name: "Someone", matchId: event.matchId });
    }
    socket.on("match:new", onMatchNew);
    return () => {
      socket.off("match:new", onMatchNew);
    };
  }, [user]);

  const loadMore = React.useCallback(() => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    discover(nextCursor)
      .then((result) => {
        setFeed((f) => [...(f ?? []), ...result.profiles]);
        setNextCursor(result.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  }, [nextCursor, loadingMore]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (feed && feed.length <= LOW_FEED_THRESHOLD) loadMore();
  }, [feed, loadMore]);

  function handleSwipe(target: DatingProfile, direction: SwipeDirection) {
    setBusy(true);
    setError(null);
    if (direction === "SUPERLIKE") setSuperlikesRemaining((n) => Math.max(0, n - 1));
    swipe(target.userId, direction)
      .then((result) => {
        setFeed((f) => (f ? f.filter((p) => p.userId !== target.userId) : f));
        if (result.matched) {
          setMatch({ name: target.displayName, matchId: result.matchId });
        }
      })
      .catch((err) => {
        if (direction === "SUPERLIKE") setSuperlikesRemaining((n) => n + 1);
        setError(err instanceof ApiError ? err.message : "That didn't go through.");
      })
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
                <Skeleton className="h-[460px] w-full max-w-[380px] rounded-2xl" />
              ) : (
                <SwipeDeck
                  profiles={feed}
                  busy={busy}
                  superlikesRemaining={superlikesRemaining}
                  onSwipe={handleSwipe}
                />
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
