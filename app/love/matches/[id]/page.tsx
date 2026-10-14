import { LoveMatchThread } from "./thread";

// This page has no sensible static shell: every render depends on the
// [id] route param and a live fetch of that match's messages. Opt out of
// the instant-navigation prerender requirement instead of wrapping the
// whole page in nested Suspense boundaries just to satisfy it.
export const instant = false;

export default async function LoveMatchThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LoveMatchThread matchId={id} />;
}
