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

export function login(input: { email: string; password: string }) {
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
