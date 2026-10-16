"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { getDatingSocket, type MessageNewEvent, type MessageReadEvent, type PresenceEvent, type TypingEvent } from "@/lib/dating-socket";
import {
  getMatches,
  getMessages,
  sendMessage,
  markMessagesRead,
  unmatch,
  blockUser,
  reportUser,
  type MatchRow,
  type Message,
  type ReportReason,
} from "@/lib/dating";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "INAPPROPRIATE_PHOTOS", label: "Inappropriate photos" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "FAKE_PROFILE", label: "Fake profile" },
  { value: "SPAM", label: "Spam" },
  { value: "UNDERAGE", label: "Underage" },
  { value: "OTHER", label: "Other" },
];

const TYPING_IDLE_MS = 2000;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function LoveMatchThread({ matchId }: { matchId: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [match, setMatch] = React.useState<MatchRow | null>(null);
  const [messages, setMessages] = React.useState<Message[] | null>(null);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [otherTyping, setOtherTyping] = React.useState(false);
  const [otherOnline, setOtherOnline] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [modal, setModal] = React.useState<"unmatch" | "block" | "report" | null>(null);
  const [reportReason, setReportReason] = React.useState<ReportReason>("OTHER");
  const [reportDetails, setReportDetails] = React.useState("");
  const [actionBusy, setActionBusy] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasTypingRef = React.useRef(false);

  React.useEffect(() => {
    if (!user) return;
    getMatches().then((rows) => setMatch(rows.find((m) => m.id === matchId) ?? null));
  }, [user, matchId]);

  React.useEffect(() => {
    if (!user) return;
    getMessages(matchId).then(setMessages);
  }, [user, matchId]);

  React.useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const socket = getDatingSocket();
    socket.emit("match:join", { matchId });

    function onMessageNew(msg: MessageNewEvent) {
      if (msg.matchId !== matchId) return;
      setMessages((prev) => {
        if (!prev) return prev;
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderId !== userId) setOtherTyping(false);
    }
    function onMessageRead(event: MessageReadEvent) {
      if (event.matchId !== matchId || event.readerId === userId) return;
      setMessages((prev) => (prev ? prev.map((m) => (m.senderId === userId ? { ...m, readAt: m.readAt ?? new Date().toISOString() } : m)) : prev));
    }
    function onTyping(event: TypingEvent) {
      if (event.matchId !== matchId || event.userId === userId) return;
      setOtherTyping(event.isTyping);
    }
    function onPresence(event: PresenceEvent) {
      setOtherOnline(event.online);
    }

    socket.on("message:new", onMessageNew);
    socket.on("message:read", onMessageRead);
    socket.on("typing", onTyping);
    socket.on("presence", onPresence);

    return () => {
      socket.emit("match:leave", { matchId });
      socket.off("message:new", onMessageNew);
      socket.off("message:read", onMessageRead);
      socket.off("typing", onTyping);
      socket.off("presence", onPresence);
    };
  }, [user, matchId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (!user || !messages) return;
    const hasUnread = messages.some((m) => m.senderId !== user.id && !m.readAt);
    if (hasUnread) markMessagesRead(matchId).catch(() => {});
  }, [user, matchId, messages]);

  function handleDraftChange(value: string) {
    setDraft(value);
    const socket = getDatingSocket();
    if (!wasTypingRef.current) {
      socket.emit("typing:start", { matchId });
      wasTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { matchId });
      wasTypingRef.current = false;
    }, TYPING_IDLE_MS);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    getDatingSocket().emit("typing:stop", { matchId });
    wasTypingRef.current = false;

    setDraft("");
    setSending(true);
    setError(null);

    sendMessage(matchId, body)
      .then((real) => {
        setMessages((prev) => {
          if (!prev) return prev;
          if (prev.some((m) => m.id === real.id)) return prev;
          return [...prev, real];
        });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Message didn't send.");
      })
      .finally(() => setSending(false));
  }

  function handleUnmatch() {
    setActionBusy(true);
    unmatch(matchId)
      .then(() => router.push("/love/matches"))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't unmatch."))
      .finally(() => setActionBusy(false));
  }

  function handleBlock() {
    if (!match?.otherUser) return;
    setActionBusy(true);
    blockUser(match.otherUser.userId)
      .then(() => router.push("/love/matches"))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't block."))
      .finally(() => setActionBusy(false));
  }

  function handleReport() {
    if (!match?.otherUser) return;
    setActionBusy(true);
    reportUser({ userId: match.otherUser.userId, reason: reportReason, details: reportDetails.trim() || undefined })
      .then(() => setModal(null))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't submit report."))
      .finally(() => setActionBusy(false));
  }

  if (authLoading || !user) {
    return (
      <>
        <Header business="love" active="matches" />
        <main className="flex-1 ins-container py-12">
          <Skeleton className="h-96 w-full max-w-[640px] mx-auto rounded-lg" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header business="love" active="matches" />
      <main className="flex-1 flex flex-col">
        <div className="ins-container py-8 max-w-[640px] mx-auto flex flex-col gap-4 flex-1 w-full">
          <div className="flex items-center gap-3">
            <span className="relative size-10 grid place-items-center bg-accent-100 text-accent-700 rounded-full font-semibold overflow-hidden">
              {match?.otherUser?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.otherUser.photoUrl} alt={match.otherUser.displayName} className="w-full h-full object-cover" />
              ) : match?.otherUser ? (
                initials(match.otherUser.displayName)
              ) : (
                <Icon name="user" size={16} />
              )}
              {otherOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-card" />
              )}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{match?.otherUser?.displayName ?? "Instanta user"}</div>
              <div className="text-xs text-neutral-600">
                {otherTyping ? "Typing…" : match?.otherUser?.city ?? ""}
              </div>
            </div>
            <div className="relative">
              <Button variant="secondary" size="icon" onClick={() => setMenuOpen((v) => !v)} aria-label="More options">
                <Icon name="menu" size={18} />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-divider rounded-lg shadow-md overflow-hidden z-10">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100"
                    onClick={() => {
                      setMenuOpen(false);
                      setModal("report");
                    }}
                  >
                    Report
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 text-error"
                    onClick={() => {
                      setMenuOpen(false);
                      setModal("block");
                    }}
                  >
                    Block
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 text-error"
                    onClick={() => {
                      setMenuOpen(false);
                      setModal("unmatch");
                    }}
                  >
                    Unmatch
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 bg-card border border-divider rounded-lg p-4 min-h-[380px] overflow-y-auto">
            {!messages ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : messages.length === 0 ? (
              <EmptyState icon="chat" title="Say hello" description="You matched — send the first message." />
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col items-end gap-0.5">
                      <div
                        className={
                          mine
                            ? "max-w-[75%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-accent text-white text-sm"
                            : "max-w-[75%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-neutral-100 text-text text-sm"
                        }
                      >
                        {m.body}
                      </div>
                      {mine && m.readAt && <span className="text-[11px] text-neutral-500 pr-1">Seen</span>}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && <div className="text-sm text-error">{error}</div>}

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              placeholder="Type a message…"
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !draft.trim()}>
              <Icon name="arrow" size={16} />
            </Button>
          </form>
        </div>
      </main>
      <Footer />

      <Modal open={modal === "unmatch"} onClose={() => setModal(null)}>
        <ModalHeader title="Unmatch?" onClose={() => setModal(null)} />
        <ModalBody>
          <p className="m-0 text-sm text-neutral-700">
            You&apos;ll no longer be able to message {match?.otherUser?.displayName ?? "this person"}. This can&apos;t be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={actionBusy} onClick={handleUnmatch}>
            {actionBusy ? "Unmatching…" : "Unmatch"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={modal === "block"} onClose={() => setModal(null)}>
        <ModalHeader title="Block this person?" onClose={() => setModal(null)} />
        <ModalBody>
          <p className="m-0 text-sm text-neutral-700">
            They won&apos;t be able to see your profile or message you again, and your match will end.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={actionBusy} onClick={handleBlock}>
            {actionBusy ? "Blocking…" : "Block"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={modal === "report"} onClose={() => setModal(null)}>
        <ModalHeader title="Report this person" onClose={() => setModal(null)} />
        <ModalBody>
          <div className="flex flex-col gap-3">
            <Select value={reportReason} onChange={(e) => setReportReason(e.target.value as ReportReason)}>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Add any details that'll help us review this (optional)"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={actionBusy} onClick={handleReport}>
            {actionBusy ? "Submitting…" : "Submit report"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
