import { apiFetch } from "@/lib/api";

export interface WorkspaceSummary {
  id: string;
  type: "PERSONAL" | "BUSINESS";
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  defaultAddress?: string | null;
  currency?: string;
  walletCents?: number;
  emailVerified?: boolean;
  workspaceMembers?: {
    role: "OWNER" | "ADMIN" | "MEMBER";
    workspace: WorkspaceSummary;
  }[];
}

export interface AuthResponse {
  user: AuthUser;
}

export function registerAccount(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string; rememberMe?: boolean }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<AuthUser>("/auth/me");
}

export function forgotPassword(input: { email: string }) {
  return apiFetch<{ ok: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return apiFetch<{ ok: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyEmail(input: { token: string }) {
  return apiFetch<{ ok: boolean }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resendVerification() {
  return apiFetch<{ ok: boolean }>("/auth/resend-verification", { method: "POST" });
}
