import { apiFetch } from "@/lib/api";

export type Gender = "male" | "female" | "other";
export type InterestedIn = "male" | "female" | "everyone";

export interface DatingProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  birthdate: string;
  gender: Gender;
  interestedIn: InterestedIn;
  photos: string[];
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDatingProfileInput {
  displayName: string;
  bio: string;
  birthdate: string;
  gender: Gender;
  interestedIn: InterestedIn;
  city: string;
  photos?: string[];
}

export type UpdateDatingProfileInput = Partial<CreateDatingProfileInput> & { isActive?: boolean };

export type SwipeDirection = "LIKE" | "PASS";

export type SwipeResult =
  | { matched: false }
  | { matched: true; matchId: string; otherUserId: string };

export interface MatchRow {
  id: string;
  createdAt: string;
  otherUser: { userId: string; displayName: string; photos: string[]; city: string } | null;
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

export function discover() {
  return apiFetch<DatingProfile[]>("/dating/discover");
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

export function ageFromBirthdate(birthdate: string) {
  const b = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const notYetBirthday =
    now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (notYetBirthday) age -= 1;
  return age;
}
