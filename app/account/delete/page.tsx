"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { SectionKicker } from "@/components/ui/section-kicker";
import { SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import type { SupportTicketSummary } from "@/lib/account";
import {
  DELETION_DELETED,
  DELETION_KEPT,
  DELETION_NOTE_MAX,
  getPendingDeletionRequest,
  requestAccountDeletion,
} from "@/lib/account-deletion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
}

export default function DeleteAccountPage() {
  const [pending, setPending] = React.useState<SupportTicketSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getPendingDeletionRequest()
      .then(setPending)
      .catch(() => setError("Couldn't check for an existing deletion request."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Checking the server for an open deletion request on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSend() {
    setSending(true);
    setSendError(null);
    try {
      const ticket = await requestAccountDeletion(note);
      setPending(ticket);
      setConfirmOpen(false);
      setNote("");
      toast("Deletion requested.", "success");
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Couldn't send the request. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <PageHeader title="Delete account" subtitle="Ask us to delete your Instanta account and personal data." />

      {loading && <SkeletonText lines={4} />}

      {!loading && error && (
        <EmptyState
          icon="alert"
          title="Couldn't load this page"
          description={error}
          action={
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          }
        />
      )}

      {!loading && !error && pending && (
        <div className="flex flex-col gap-2 bg-card border border-divider rounded-lg p-4" role="status">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Icon name="check" size={18} className="text-accent-700" />
            Deletion requested
          </div>
          <p className="text-sm text-neutral-700 m-0">
            You asked on {formatDate(pending.createdAt)}. Reference {pending.reference}. Our support team will
            contact you at your account email before anything is deleted.
          </p>
          <Link href={`/account/support/${pending.id}`} className="text-sm text-accent-700 self-start">
            View the request
          </Link>
        </div>
      )}

      {!loading && !error && !pending && (
        <>
          <div className="flex flex-col gap-4 bg-card border border-divider rounded-lg p-4">
            <p className="text-sm text-neutral-700 m-0">
              Our support team deletes accounts on request. They&apos;ll contact you at your account email before
              deleting anything, including about crypto, deliveries or trips that are still open. You can keep
              using Instanta until then.
            </p>
            <div>
              <SectionKicker>What we delete</SectionKicker>
              <ul className="text-sm text-neutral-700 m-0 pl-5 flex flex-col gap-1">
                {DELETION_DELETED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionKicker>What we keep</SectionKicker>
              <ul className="text-sm text-neutral-700 m-0 pl-5 flex flex-col gap-1">
                {DELETION_KEPT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSendError(null);
              setConfirmOpen(true);
            }}
            className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4"
          >
            <Field
              label="Anything we should know?"
              optional
              htmlFor="deletion-note"
              hint={`${note.length}/${DELETION_NOTE_MAX}`}
            >
              <Textarea
                id="deletion-note"
                value={note}
                maxLength={DELETION_NOTE_MAX}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            <Button type="submit" className="self-start">
              Request deletion
            </Button>
          </form>
        </>
      )}

      <Modal open={confirmOpen} onClose={() => !sending && setConfirmOpen(false)}>
        <ModalHeader title="Request deletion?" onClose={sending ? undefined : () => setConfirmOpen(false)} />
        <ModalBody>
          Our support team will contact you before deleting anything. You can keep using Instanta until then.
          {sendError && <div className="text-sm text-error mt-3">{sendError}</div>}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" disabled={sending} onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={sending} onClick={handleSend}>
            {sending ? "Sending…" : "Send request"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
