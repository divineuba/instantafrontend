"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Card, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { getMatches, type MatchRow } from "@/lib/dating";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function LoveMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [matches, setMatches] = React.useState<MatchRow[] | null>(null);

  React.useEffect(() => {
    if (!user) return;
    getMatches().then(setMatches);
  }, [user]);

  return (
    <>
      <Header business="love" active="matches" />
      <main className="flex-1">
        <div className="ins-container py-12 max-w-[640px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-semibold">Your matches</h1>
            <p className="text-neutral-700 m-0">People you&apos;ve liked each other with.</p>
          </div>

          {!authLoading && !user ? (
            <Card className="items-start gap-3">
              <Tag variant="accent">Sign in required</Tag>
              <CardTitle>Sign in to see your matches</CardTitle>
              <LinkButton href={`/login?next=${encodeURIComponent(pathname ?? "/love/matches")}`} variant="primary">
                Sign in
              </LinkButton>
            </Card>
          ) : !matches ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon="heart"
              title="No matches yet"
              description="Start discovering to find people you'll match with."
              action={<LinkButton href="/love/discover" variant="primary">Start matching</LinkButton>}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((m) => (
                <a
                  key={m.id}
                  href={`/love/matches/${m.id}`}
                  className="flex items-center gap-3.5 p-3.5 bg-card border border-divider rounded-lg no-underline text-text hover:border-neutral-300 hover:shadow-md transition-[box-shadow,border-color] duration-150"
                >
                  <span className="size-12 shrink-0 grid place-items-center bg-accent-100 text-accent-700 rounded-full font-semibold overflow-hidden">
                    {m.otherUser?.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.otherUser.photoUrl} alt={m.otherUser.displayName} className="w-full h-full object-cover" />
                    ) : m.otherUser ? (
                      initials(m.otherUser.displayName)
                    ) : (
                      <Icon name="user" size={18} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="font-semibold">{m.otherUser?.displayName ?? "Instanta user"}</span>
                    <span className="text-sm text-neutral-600 truncate">
                      {m.lastMessage ? m.lastMessage.body : "Say hello — you matched!"}
                    </span>
                  </div>
                  {m.unreadCount > 0 && (
                    <span className="size-5 shrink-0 grid place-items-center bg-accent text-white rounded-full text-[11px] font-semibold">
                      {m.unreadCount > 9 ? "9+" : m.unreadCount}
                    </span>
                  )}
                  <Icon name="right" size={16} className="text-neutral-400 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
