import { createSupportTicket, getSupportTickets, type SupportTicketSummary } from "@/lib/account";

/** Account deletion is a request the support team carries out: the web, like
 * the mobile app, files a support ticket with this subject. The backend has
 * no deletion endpoint. Keep these in step with the app
 * (mobile/lib/features/account/data/account_deletion.dart). */
export const DELETION_SUBJECT = "Delete my account";
export const DELETION_NOTE_MAX = 500;

/** What the public page and the request form say happens. Kept to what the
 * privacy policy (app/privacy) already commits to. */
export const DELETION_DELETED = [
  "Your Instanta account and sign-in",
  "Your profile and the personal details saved to it, such as your phone number, addresses and saved passengers",
  "Your Love profile and photos, if you have one",
];

export const DELETION_KEPT = [
  "Records of deliveries, bookings, payments and crypto transactions, for as long as legal and accounting requirements need them, as our privacy policy describes",
];

/** The deletion request still waiting on support, if there is one, so the
 * person isn't asked to file a second. */
export async function getPendingDeletionRequest(): Promise<SupportTicketSummary | null> {
  const tickets = await getSupportTickets();
  return (
    tickets.find(
      (t) => t.subject === DELETION_SUBJECT && (t.status === "OPEN" || t.status === "AWAITING"),
    ) ?? null
  );
}

export function requestAccountDeletion(note: string) {
  const trimmed = note.trim();
  return createSupportTicket({
    subject: DELETION_SUBJECT,
    category: "Account",
    body: ["Please delete my Instanta account.", ...(trimmed ? [`Note: ${trimmed}`] : [])].join("\n\n"),
  });
}
