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
  presignPhotoUpload,
  addPhoto,
  deletePhoto,
  reorderPhotos,
  listBlocks,
  unblockUser,
  ageFromBirthdate,
  BIO_MAX,
  CITY_MAX,
  DISPLAY_NAME_MAX,
  type DatingProfile,
  type MatchRow,
  type DatingBlock,
  type Gender,
  type InterestedIn,
} from "@/lib/dating";

const MAX_PHOTOS = 6;

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
  const [blocks, setBlocks] = React.useState<DatingBlock[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [photoBusy, setPhotoBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState<{
    displayName: string;
    bio: string;
    city: string;
    gender: Gender;
    interestedIn: InterestedIn;
    interests: string;
    minAgePref: string;
    maxAgePref: string;
    maxDistanceKm: string;
  }>({
    displayName: "",
    bio: "",
    city: "",
    gender: "female",
    interestedIn: "everyone",
    interests: "",
    minAgePref: "",
    maxAgePref: "",
    maxDistanceKm: "",
  });
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([getMyProfile(), getMatches(), listBlocks()])
      .then(([p, m, b]) => {
        setProfile(p);
        setMatches(m);
        setBlocks(b);
        if (p) {
          setForm({
            displayName: p.displayName,
            bio: p.bio,
            city: p.city,
            gender: p.gender,
            interestedIn: p.interestedIn,
            interests: p.interests.join(", "),
            minAgePref: p.minAgePref != null ? String(p.minAgePref) : "",
            maxAgePref: p.maxAgePref != null ? String(p.maxAgePref) : "",
            maxDistanceKm: p.maxDistanceKm != null ? String(p.maxDistanceKm) : "",
          });
        }
      })
      .catch(() => setError("Couldn't load your Love account."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading profile/matches/blocks from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    updateProfile({
      displayName: form.displayName,
      bio: form.bio,
      city: form.city,
      gender: form.gender,
      interestedIn: form.interestedIn,
      interests: form.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, 10),
      // An emptied preference field clears it on the server.
      minAgePref: form.minAgePref ? Number(form.minAgePref) : null,
      maxAgePref: form.maxAgePref ? Number(form.maxAgePref) : null,
      maxDistanceKm: form.maxDistanceKm ? Number(form.maxDistanceKm) : null,
    })
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

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile) return;
    setPhotoBusy(true);
    presignPhotoUpload(file.type)
      .then(async ({ uploadUrl, key }) => {
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error("Upload failed");
        return addPhoto({ key });
      })
      .then((photo) => {
        setProfile((p) => (p ? { ...p, photos: [...p.photos, photo] } : p));
      })
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't upload photo.", "error"))
      .finally(() => setPhotoBusy(false));
  }

  function handleDeletePhoto(photoId: string) {
    if (!profile) return;
    setPhotoBusy(true);
    deletePhoto(photoId)
      .then(() => setProfile((p) => (p ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) } : p)))
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't delete photo.", "error"))
      .finally(() => setPhotoBusy(false));
  }

  function movePhoto(photoId: string, direction: -1 | 1) {
    if (!profile) return;
    const index = profile.photos.findIndex((p) => p.id === photoId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= profile.photos.length) return;
    const reordered = [...profile.photos];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    setProfile({ ...profile, photos: reordered });
    setPhotoBusy(true);
    reorderPhotos(reordered.map((p) => p.id))
      .then((photos) => setProfile((p) => (p ? { ...p, photos } : p)))
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't reorder photos.", "error"))
      .finally(() => setPhotoBusy(false));
  }

  function handleUnblock(targetUserId: string) {
    unblockUser(targetUserId)
      .then(() => setBlocks((b) => (b ? b.filter((x) => x.blockedId !== targetUserId) : b)))
      .catch((err) => toast(err instanceof ApiError ? err.message : "Couldn't unblock.", "error"));
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
            <span className="size-14 shrink-0 grid place-items-center bg-accent-100 text-accent-700 rounded-full text-lg font-semibold overflow-hidden">
              {profile.photos[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photos[0].url} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                initials(profile.displayName)
              )}
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

          <div className="pt-2 border-t border-divider flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Photos ({profile.photos.length}/{MAX_PHOTOS})</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoFile} />
              <Button
                variant="secondary"
                disabled={photoBusy || profile.photos.length >= MAX_PHOTOS}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoBusy ? "Uploading…" : "Add photo"}
              </Button>
            </div>
            {profile.photos.length === 0 ? (
              <p className="text-sm text-neutral-600 m-0">No photos yet — add one so people can see you.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {profile.photos.map((photo, i) => (
                  <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border border-divider group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {photo.status === "PENDING" && (
                      <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-warning text-white font-medium">
                        Pending
                      </span>
                    )}
                    {photo.status === "REJECTED" && (
                      <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-error text-white font-medium">
                        Rejected
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity py-1">
                      <button
                        type="button"
                        className="text-white p-0.5 disabled:opacity-30"
                        disabled={i === 0 || photoBusy}
                        onClick={() => movePhoto(photo.id, -1)}
                        aria-label="Move earlier"
                      >
                        <Icon name="back" size={14} />
                      </button>
                      <button
                        type="button"
                        className="text-white p-0.5 disabled:opacity-30"
                        disabled={photoBusy}
                        onClick={() => handleDeletePhoto(photo.id)}
                        aria-label="Delete photo"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                      <button
                        type="button"
                        className="text-white p-0.5 disabled:opacity-30"
                        disabled={i === profile.photos.length - 1 || photoBusy}
                        onClick={() => movePhoto(photo.id, 1)}
                        aria-label="Move later"
                      >
                        <Icon name="right" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3 pt-2 border-t border-divider">
            <Field label="Name">
              <Input value={form.displayName} maxLength={DISPLAY_NAME_MAX} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <Input value={form.city} maxLength={CITY_MAX} onChange={(e) => setForm({ ...form, city: e.target.value })} />
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
              <Textarea value={form.bio} maxLength={BIO_MAX} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </Field>
            <Field label="Interests (comma separated)">
              <Input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="hiking, jazz, cooking" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Min age">
                <Input type="number" min={18} max={99} value={form.minAgePref} onChange={(e) => setForm({ ...form, minAgePref: e.target.value })} />
              </Field>
              <Field label="Max age">
                <Input type="number" min={18} max={99} value={form.maxAgePref} onChange={(e) => setForm({ ...form, maxAgePref: e.target.value })} />
              </Field>
              <Field label="Max distance (km)">
                <Input type="number" min={1} max={500} value={form.maxDistanceKm} onChange={(e) => setForm({ ...form, maxDistanceKm: e.target.value })} />
              </Field>
            </div>
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
                <span className="size-10 shrink-0 grid place-items-center bg-accent-100 text-accent-700 rounded-full font-semibold text-sm overflow-hidden">
                  {m.otherUser?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.otherUser.photoUrl} alt={m.otherUser.displayName} className="w-full h-full object-cover" />
                  ) : m.otherUser ? (
                    initials(m.otherUser.displayName)
                  ) : (
                    <Icon name="user" size={14} />
                  )}
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

      {blocks && blocks.length > 0 && (
        <div>
          <SectionKicker>Blocked users</SectionKicker>
          <div className="flex flex-col gap-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-card border border-divider rounded-lg">
                <span className="flex-1 flex flex-col">
                  <span className="text-sm font-medium">{b.displayName ?? "Instanta member"}</span>
                  <span className="text-xs text-neutral-600">Blocked on {new Date(b.createdAt).toLocaleDateString()}</span>
                </span>
                <Button variant="secondary" onClick={() => handleUnblock(b.blockedId)}>
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
