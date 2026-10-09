"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { getActivity, type ActivityResponse } from "@/lib/account";

type Tab = "all" | "deliveries" | "flights" | "payments";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deliveries", label: "Deliveries" },
  { key: "flights", label: "Flights" },
  { key: "payments", label: "Payments" },
];

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["delivered", "completed", "paid", "confirmed", "resolved"].includes(s)) return "success";
  if (["pending", "awaiting", "processing", "in transit", "transit"].includes(s)) return "warning";
  if (["failed", "declined", "cancelled", "closed"].includes(s)) return "error";
  return "neutral";
}

export default function ActivityPage() {
  const [tab, setTab] = React.useState<Tab>("all");
  const [data, setData] = React.useState<ActivityResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-5 max-w-[920px]">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-neutral-600 mt-1">
          All your deliveries, trips, and payments in one place.
        </p>
      </div>

      <div className="flex gap-1 border-b border-divider">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-sm font-medium border-0 border-b-2 bg-transparent cursor-pointer -mb-px ${
              tab === t.key
                ? "text-accent-800 border-accent"
                : "text-neutral-600 border-transparent hover:text-text"
            }`}
          >
            {t.label}
            {data && t.key !== "all" && (
              <span className="ml-1.5 text-xs text-neutral-500">
                ({data.counts[t.key === "deliveries" ? "deliveries" : t.key === "flights" ? "flights" : "payments"]})
              </span>
            )}
            {data && t.key === "all" && (
              <span className="ml-1.5 text-xs text-neutral-500">({data.counts.all})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {!loading && !error && data && (
        <div className="flex flex-col gap-1">
          {data.rows.length === 0 && (
            <div className="text-sm text-neutral-600 py-8 text-center">
              Nothing here yet.
            </div>
          )}
          {data.rows.map((row, i) => (
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
