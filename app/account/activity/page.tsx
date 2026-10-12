"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getActivity, type ActivityResponse } from "@/lib/account";

type Tab = "all" | "deliveries" | "flights" | "payments" | "crypto";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deliveries", label: "Deliveries" },
  { key: "flights", label: "Flights" },
  { key: "payments", label: "Payments" },
  { key: "crypto", label: "Crypto" },
];

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["delivered", "completed", "paid", "confirmed", "resolved"].includes(s)) return "success";
  if (["pending", "awaiting", "processing", "in transit", "transit"].includes(s)) return "warning";
  if (["failed", "declined", "cancelled", "closed"].includes(s)) return "error";
  return "neutral";
}

function ActivityBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = React.useState(q);
  const [tab, setTab] = React.useState<Tab>("all");
  const [data, setData] = React.useState<ActivityResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Keeps the input in sync when the URL's `q` changes from elsewhere
    // (e.g. the header search form navigating here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(q);
  }, [q]);

  React.useEffect(() => {
    let active = true;
    // Re-querying the server whenever `tab` changes and flagging it as
    // in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getActivity(tab)
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load activity.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab]);

  const filteredRows = React.useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data.rows;
    return data.rows.filter(
      (row) =>
        row.title.toLowerCase().includes(term) ||
        row.ref.toLowerCase().includes(term) ||
        row.vertical.toLowerCase().includes(term),
    );
  }, [data, q]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = searchTerm.trim();
    router.push(term ? `/account/activity?q=${encodeURIComponent(term)}` : "/account/activity");
  }

  return (
    <div className="flex flex-col gap-5 max-w-[920px]">
      <PageHeader
        title="Activity"
        subtitle="All your deliveries, trips, and payments in one place."
      />

      <form onSubmit={submitSearch} className="relative max-w-sm">
        <span className="absolute left-2.5 top-2.5 text-neutral-600">
          <Icon name="search" size={16} />
        </span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full min-h-[38px] pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]"
          placeholder="Search by title or reference…"
        />
      </form>

      <div className="flex gap-1 border-b border-divider overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-2.5 text-sm font-medium border-0 border-b-2 bg-transparent cursor-pointer -mb-px whitespace-nowrap ${
              tab === t.key
                ? "text-accent-800 border-accent"
                : "text-neutral-600 border-transparent hover:text-text"
            }`}
          >
            {t.label}
            {data && t.key !== "all" && (
              <span className="ml-1.5 text-xs text-neutral-500">
                ({data.counts[t.key]})
              </span>
            )}
            {data && t.key === "all" && (
              <span className="ml-1.5 text-xs text-neutral-500">({data.counts.all})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <SkeletonText lines={5} />}
      {error && <EmptyState icon="alert" title="Couldn't load activity" description={error} />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-1">
          {filteredRows.length === 0 && (
            <EmptyState
              icon="activity"
              title={q ? "No matches" : "Nothing here yet"}
              description={
                q
                  ? `Nothing matches "${q}" in this filter.`
                  : "Activity for this filter will show up here."
              }
            />
          )}
          {filteredRows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg"
            >
              <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                <Icon name={row.icon as never} size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-accent-700 font-semibold">{row.vertical}</span>
                <span className="block text-sm font-medium truncate">{row.title}</span>
                <span className="block text-xs text-neutral-600">
                  {row.ref} · {row.date}
                </span>
              </span>
              <span className="text-sm font-medium">{row.amount}</span>
              <Tag variant={statusVariant(row.status)}>{row.status}</Tag>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <React.Suspense fallback={<SkeletonText lines={5} />}>
      <ActivityBody />
    </React.Suspense>
  );
}
