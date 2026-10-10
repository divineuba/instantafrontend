"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { ApiError } from "@/lib/api";
import { getSupportTicket, addSupportMessage, type SupportTicketDetail } from "@/lib/account";

export default function SupportTicketPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = React.useState<SupportTicketDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    getSupportTicket(params.id)
      .then(setTicket)
      .catch(() => setError("Couldn't load this ticket."))
      .finally(() => setLoading(false));
  }, [params.id]);

  React.useEffect(() => {
    // Re-querying the server whenever the ticket id changes is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) {
      setReplyError("Message can't be empty");
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      const updated = await addSupportMessage(params.id, reply);
      setTicket(updated);
      setReply("");
    } catch (err) {
      setReplyError(err instanceof ApiError ? err.message : "Couldn't send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="text-sm text-neutral-600">Loading ticket…</div>;
  if (error && !ticket) return <div className="text-sm text-error">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="flex flex-col gap-5 max-w-[720px]">
      <button
        type="button"
        onClick={() => router.push("/account/support")}
        className="flex items-center gap-1.5 text-sm text-neutral-600 bg-transparent border-0 p-0 cursor-pointer self-start"
      >
        <Icon name="back" size={14} /> Back to support
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            {ticket.reference} · {ticket.category}
          </p>
        </div>
        <Tag variant={ticket.status === "RESOLVED" ? "success" : ticket.status === "AWAITING" ? "warning" : "info"}>
          {ticket.status}
        </Tag>
      </div>

      <div className="flex flex-col gap-3">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1 px-4 py-3 rounded-lg border max-w-[85%] ${
              m.author === "USER"
                ? "self-end bg-accent-100 border-accent-200"
                : "self-start bg-card border-divider"
            }`}
          >
            <span className="text-xs font-semibold text-neutral-600">
              {m.author === "USER" ? "You" : "Support"} · {new Date(m.createdAt).toLocaleString()}
            </span>
            <span className="text-sm">{m.body}</span>
          </div>
        ))}
      </div>

      {ticket.status !== "CLOSED" && (
        <form onSubmit={handleReply} className="flex flex-col gap-2">
          {replyError && <div className="text-sm text-error">{replyError}</div>}
          <Textarea
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onBlur={() => setReplyError(reply.trim() ? null : "Message can't be empty")}
          />
          <Button type="submit" disabled={sending} className="self-end">
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </form>
      )}
    </div>
  );
}
