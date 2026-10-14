"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { getMatches, getMessages, sendMessage, type MatchRow, type Message } from "@/lib/dating";

const POLL_INTERVAL_MS = 5000;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function LoveMatchThreadPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { user, loading: authLoading } = useAuth();

  const [match, setMatch] = React.useState<MatchRow | null>(null);
  const [messages, setMessages] = React.useState<Message[] | null>(null);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const lastSeenRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!user) return;
    getMatches().then((rows) => setMatch(rows.find((m) => m.id === matchId) ?? null));
  }, [user, matchId]);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMessages(matchId).then((msgs) => {
      if (cancelled) return;
      setMessages(msgs);
      if (msgs.length > 0) lastSeenRef.current = msgs[msgs.length - 1].createdAt;
    });

    const interval = setInterval(() => {
      getMessages(matchId, lastSeenRef.current)
        .then((fresh) => {
          if (cancelled || fresh.length === 0) return;
          setMessages((prev) => {
            const existing = new Set((prev ?? []).map((m) => m.id));
            const toAdd = fresh.filter((m) => !existing.has(m.id));
            if (toAdd.length === 0) return prev;
            return [...(prev ?? []), ...toAdd];
          });
          lastSeenRef.current = fresh[fresh.length - 1].createdAt;
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, matchId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      matchId,
      senderId: user.id,
      body,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...(prev ?? []), optimistic]);
    setDraft("");
    setSending(true);
    setError(null);

    sendMessage(matchId, body)
      .then((real) => {
        setMessages((prev) => (prev ?? []).map((m) => (m.id === tempId ? real : m)));
        lastSeenRef.current = real.createdAt;
      })
      .catch((err) => {
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== tempId));
        setError(err instanceof ApiError ? err.message : "Message didn't send.");
      })
      .finally(() => setSending(false));
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
            <span className="size-10 grid place-items-center bg-accent-100 text-accent-700 rounded-full font-semibold">
              {match?.otherUser ? initials(match.otherUser.displayName) : <Icon name="user" size={16} />}
            </span>
            <div>
              <div className="font-semibold">{match?.otherUser?.displayName ?? "Instanta user"}</div>
              {match?.otherUser?.city && <div className="text-xs text-neutral-600">{match.otherUser.city}</div>}
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
                    <div
                      className={
                        mine
                          ? "max-w-[75%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-accent text-white text-sm"
                          : "max-w-[75%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-neutral-100 text-text text-sm"
                      }
                    >
                      {m.body}
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
              onChange={(e) => setDraft(e.target.value)}
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
    </>
  );
}
