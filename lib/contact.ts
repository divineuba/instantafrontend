import { apiFetch } from "./api";

export type ContactTopic = "SUPPORT" | "SALES" | "GENERAL" | "PRESS";

export interface ContactMessageInput {
  name: string;
  email: string;
  topic: ContactTopic;
  subject: string;
  message: string;
}

export function submitContactMessage(input: ContactMessageInput) {
  return apiFetch<{ id: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
