import { apiFetch } from "@/lib/api";

export type Gender = "male" | "female" | "other";
export type InterestedIn = "male" | "female" | "everyone";
export type PhotoStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DatingPhoto {
  id: string;
  key: string;
  url: string;
  position: number;
  status: PhotoStatus;
}

export interface DatingProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  birthdate: string;
  gender: Gender;
  interestedIn: InterestedIn;
  city: string;
  latitude: number | null;
  longitude: number | null;
  interests: string[];
  minAgePref: number | null;
  maxAgePref: number | null;
  maxDistanceKm: number | null;
  dailySwipeCount: number;
  dailySwipeResetAt: string;
  superlikesRemaining: number;
  isActive: boolean;
  photos: DatingPhoto[];
  createdAt: string;
  updatedAt: string;
}

/// Someone else's profile as Discover returns it: an age rather than a birth
/// date, and no location beyond the city.
export interface DiscoverProfile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photos: { id: string; url: string; position: number }[];
}

/// The server's caps (UpsertDatingProfileDto).
export const DISPLAY_NAME_MAX = 40;
export const CITY_MAX = 80;
export const BIO_MAX = 500;

export interface CreateDatingProfileInput {
  displayName: string;
  bio: string;
  birthdate: string;
  gender: Gender;
  interestedIn: InterestedIn;
  city: string;
  interests?: string[];
  minAgePref?: number;
  maxAgePref?: number;
  maxDistanceKm?: number;
}

/// The preferences take null to clear them.
export type UpdateDatingProfileInput = Partial<
  Omit<CreateDatingProfileInput, "minAgePref" | "maxAgePref" | "maxDistanceKm">
> & {
  minAgePref?: number | null;
  maxAgePref?: number | null;
  maxDistanceKm?: number | null;
  isActive?: boolean;
};

export type SwipeDirection = "LIKE" | "PASS" | "SUPERLIKE";

export type SwipeResult =
  | { matched: false }
  | { matched: true; matchId: string; otherUserId: string };

export interface DiscoverResult {
  profiles: DiscoverProfile[];
  nextCursor: string | null;
}

export interface MatchRow {
  id: string;
  createdAt: string;
  unreadCount: number;
  otherUser: { userId: string; displayName: string; photoUrl: string | null; city: string } | null;
  lastMessage: { body: string; senderId: string; createdAt: string } | null;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export type ReportReason =
  | "INAPPROPRIATE_PHOTOS"
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "SPAM"
  | "UNDERAGE"
  | "OTHER";

export interface DatingBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
  /** The blocked person's public name; null if they no longer have a profile. */
  displayName: string | null;
}

export interface DatingReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  details: string | null;
  status: "OPEN" | "DISMISSED" | "ACTIONED";
  createdAt: string;
}

export function getMyProfile() {
  return apiFetch<DatingProfile | null>("/dating/profile/me");
}

export function createProfile(input: CreateDatingProfileInput) {
  return apiFetch<DatingProfile>("/dating/profile", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProfile(input: UpdateDatingProfileInput) {
  return apiFetch<DatingProfile>("/dating/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function presignPhotoUpload(contentType: string) {
  return apiFetch<{ uploadUrl: string; key: string; publicUrl: string }>("/dating/profile/photos/presign", {
    method: "POST",
    body: JSON.stringify({ contentType }),
  });
}

/// The server builds the photo URL from the presigned key.
export function addPhoto(input: { key: string }) {
  return apiFetch<DatingPhoto>("/dating/profile/photos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePhoto(photoId: string) {
  return apiFetch<{ ok: true }>(`/dating/profile/photos/${encodeURIComponent(photoId)}`, {
    method: "DELETE",
  });
}

export function reorderPhotos(order: string[]) {
  return apiFetch<DatingPhoto[]>("/dating/profile/photos/reorder", {
    method: "PATCH",
    body: JSON.stringify({ order }),
  });
}

export function discover(cursor?: string, limit?: number) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch<DiscoverResult>(`/dating/discover${qs ? `?${qs}` : ""}`);
}

export function swipe(targetUserId: string, direction: SwipeDirection) {
  return apiFetch<SwipeResult>("/dating/swipe", {
    method: "POST",
    body: JSON.stringify({ targetUserId, direction }),
  });
}

export function getMatches() {
  return apiFetch<MatchRow[]>("/dating/matches");
}

export function unmatch(matchId: string) {
  return apiFetch<{ ok: true }>(`/dating/matches/${encodeURIComponent(matchId)}/unmatch`, {
    method: "POST",
  });
}

export function getMessages(matchId: string, after?: string) {
  const qs = after ? `?after=${encodeURIComponent(after)}` : "";
  return apiFetch<Message[]>(`/dating/matches/${encodeURIComponent(matchId)}/messages${qs}`);
}

export function sendMessage(matchId: string, body: string) {
  return apiFetch<Message>(`/dating/matches/${encodeURIComponent(matchId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function markMessagesRead(matchId: string) {
  return apiFetch<{ updated: number }>(`/dating/matches/${encodeURIComponent(matchId)}/messages/read`, {
    method: "POST",
  });
}

export function blockUser(userId: string) {
  return apiFetch<{ ok: true }>("/dating/block", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function unblockUser(userId: string) {
  return apiFetch<{ ok: true }>(`/dating/block/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export function listBlocks() {
  return apiFetch<DatingBlock[]>("/dating/blocks");
}

export function reportUser(input: { userId: string; reason: ReportReason; details?: string }) {
  return apiFetch<DatingReport>("/dating/report", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function ageFromBirthdate(birthdate: string) {
  const b = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const notYetBirthday =
    now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (notYetBirthday) age -= 1;
  return age;
}
