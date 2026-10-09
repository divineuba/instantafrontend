"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { getNotifications, markAllNotificationsRead, type NotificationItem } from "@/lib/account";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DELIVERY", label: "Delivery" },
  { key: "TRAVEL", label: "Travel" },
  { key: "PAYMENT", label: "Payment" },
  { key: "SYSTEM", label: "System" },
];

const TYPE_ICON: Record<NotificationItem["type"], IconName> = {
  DELIVERY: "package",
  TRAVEL: "plane",
  PAYMENT: "card",
  SYSTEM: "bell",
};

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState("all");
  const [items, setItems] = React.useState<NotificationItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    getNotifications(filter)
      .then(setItems)
      .catch(() => setError("Couldn't load notifications."))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(() => {
    // Re-querying the server whenever `filter` changes and flagging it as
    // in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    load();
  }

  return (
    <div className="flex flex-col gap-5 max-w-[720px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-neutral-600 mt-1">Updates on deliveries, trips, and payments.</p>
        </div>
        <Button variant="secondary" onClick={handleMarkAllRead}>
          Mark all read
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border cursor-pointer ${
              filter === f.key
                ? "bg-accent-100 text-accent-800 border-accent-300"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {!loading && !error && items && (
        <div className="flex flex-col gap-1">
          {items.length === 0 && (
            <div className="text-sm text-neutral-600 py-8 text-center">No notifications.</div>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border border-divider rounded-lg ${
                n.read ? "bg-card" : "bg-accent-100/40"
              }`}
            >
              <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                <Icon name={TYPE_ICON[n.type]} size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium">{n.title}</span>
                <span className="block text-xs text-neutral-600 mt-0.5">{n.body}</span>
                <span className="block text-xs text-neutral-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </span>
              {!n.read && <span className="size-2 rounded-full bg-accent mt-1.5 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
