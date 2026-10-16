"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { SwipeCard } from "@/components/love/swipe-card";
import type { DatingProfile, SwipeDirection } from "@/lib/dating";

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 500;

interface CardHandle {
  trigger: (direction: SwipeDirection) => void;
}

function exitTargetFor(direction: SwipeDirection) {
  if (direction === "PASS") return { axis: "x" as const, value: -640 };
  if (direction === "SUPERLIKE") return { axis: "y" as const, value: -760 };
  return { axis: "x" as const, value: 640 };
}

const DraggableCard = React.forwardRef<
  CardHandle,
  { profile: DatingProfile; busy: boolean; onSwipe: (direction: SwipeDirection) => void }
>(function DraggableCard({ profile, busy, onSwipe }, ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -20], [1, 0]);
  const superlikeOpacity = useTransform(y, [-140, -20], [1, 0]);

  function fireExit(direction: SwipeDirection) {
    const target = exitTargetFor(direction);
    const controls =
      target.axis === "y"
        ? animate(y, target.value, { duration: 0.3, ease: "easeIn" })
        : animate(x, target.value, { duration: 0.3, ease: "easeIn" });
    controls.then(() => onSwipe(direction));
  }

  React.useImperativeHandle(ref, () => ({ trigger: fireExit }));

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (busy) return;
    if (-info.offset.y > SWIPE_THRESHOLD && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      fireExit("SUPERLIKE");
      return;
    }
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      fireExit("LIKE");
      return;
    }
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      fireExit("PASS");
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag={!busy}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      <SwipeCard profile={profile} className="h-full" />
      <motion.span
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 px-3 py-1 rounded-lg border-[3px] border-success text-success font-bold text-xl -rotate-12 uppercase pointer-events-none select-none"
      >
        Like
      </motion.span>
      <motion.span
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-6 px-3 py-1 rounded-lg border-[3px] border-error text-error font-bold text-xl rotate-12 uppercase pointer-events-none select-none"
      >
        Nope
      </motion.span>
      <motion.span
        style={{ opacity: superlikeOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg border-[3px] border-accent text-accent font-bold text-xl uppercase pointer-events-none select-none"
      >
        Superlike
      </motion.span>
    </motion.div>
  );
});

export function SwipeDeck({
  profiles,
  busy,
  superlikesRemaining,
  onSwipe,
}: {
  profiles: DatingProfile[];
  busy: boolean;
  superlikesRemaining: number;
  onSwipe: (profile: DatingProfile, direction: SwipeDirection) => void;
}) {
  const topCardRef = React.useRef<CardHandle>(null);

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
      <div className="relative w-full max-w-[380px] h-[460px]">
        {next && (
          <SwipeCard profile={next} className="absolute inset-0 scale-[0.96] translate-y-2 opacity-70" />
        )}
        <DraggableCard
          key={top.id}
          ref={topCardRef}
          profile={top}
          busy={busy}
          onSwipe={(direction) => onSwipe(top, direction)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="size-14 rounded-full text-neutral-700"
          disabled={busy}
          onClick={() => topCardRef.current?.trigger("PASS")}
          aria-label="Pass"
        >
          <Icon name="x" size={24} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="size-11 rounded-full text-accent-700 disabled:opacity-40"
          disabled={busy || superlikesRemaining <= 0}
          onClick={() => topCardRef.current?.trigger("SUPERLIKE")}
          aria-label="Superlike"
          title={superlikesRemaining > 0 ? `${superlikesRemaining} superlike left today` : "No superlikes left today"}
        >
          <Icon name="zap" size={20} />
        </Button>
        <Button
          variant="primary"
          size="icon"
          className="size-14 rounded-full"
          disabled={busy}
          onClick={() => topCardRef.current?.trigger("LIKE")}
          aria-label="Like"
        >
          <Icon name="heart" size={24} />
        </Button>
      </div>
    </div>
  );
}
