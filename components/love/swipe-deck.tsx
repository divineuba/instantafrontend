"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { SwipeCard } from "@/components/love/swipe-card";
import type { DatingProfile } from "@/lib/dating";

export function SwipeDeck({
  profiles,
  busy,
  onSwipe,
}: {
  profiles: DatingProfile[];
  busy: boolean;
  onSwipe: (profile: DatingProfile, direction: "LIKE" | "PASS") => void;
}) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="No one new right now"
        description="Check back soon — new people join Instanta Love every day."
      />
    );
  }

  const [top, ...rest] = profiles;
  const next = rest[0];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-[380px] h-[420px]">
        {next && (
          <SwipeCard
            profile={next}
            className="absolute inset-0 scale-[0.96] translate-y-2 opacity-70"
          />
        )}
        <SwipeCard profile={top} className="absolute inset-0" />
      </div>
      <div className="flex items-center gap-5">
        <Button
          variant="secondary"
          size="icon"
          className="size-14 rounded-full text-neutral-700"
          disabled={busy}
          onClick={() => onSwipe(top, "PASS")}
          aria-label="Pass"
        >
          <Icon name="x" size={24} />
        </Button>
        <Button
          variant="primary"
          size="icon"
          className="size-14 rounded-full"
          disabled={busy}
          onClick={() => onSwipe(top, "LIKE")}
          aria-label="Like"
        >
          <Icon name="heart" size={24} />
        </Button>
      </div>
    </div>
  );
}
