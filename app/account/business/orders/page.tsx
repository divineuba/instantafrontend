"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useWorkspace } from "@/lib/workspace-context";
import { getBizOrders, type BizOrderRow } from "@/lib/account";

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["delivered", "completed", "confirmed"].includes(s)) return "success";
  if (["pending", "awaiting", "processing", "in transit", "transit"].includes(s)) return "warning";
  if (["failed", "declined", "cancelled"].includes(s)) return "error";
  return "neutral";
}

export default function BizOrdersPage() {
  const { activeMembership } = useWorkspace();
  const workspaceId = activeMembership?.workspace.id;
  const [rows, setRows] = React.useState<BizOrderRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | "Delivery" | "Flight">("all");

  React.useEffect(() => {
    if (!workspaceId) return;
    // Re-querying the server whenever the active workspace changes and
    // flagging it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getBizOrders(workspaceId)
      .then(setRows)
      .catch(() => setError("Couldn't load orders."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (!workspaceId) {
    return <EmptyState icon="building" title="No business workspace selected" />;
  }
  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-[960px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-40 h-7" />
          <Skeleton variant="text" className="w-80" />
        </div>
        <SkeletonText lines={5} />
      </div>
    );
  }
  if (error || !rows) {
    return <EmptyState icon="alert" title="Couldn't load orders" description={error ?? "Something went wrong."} />;
  }

  const filtered = filter === "all" ? rows : rows.filter((r) => r.vertical === filter);

  return (
    <div className="flex flex-col gap-5 max-w-[960px]">
      <PageHeader title="Orders & trips" subtitle="Deliveries and flights booked across your team." />

      <div className="flex gap-1.5">
        {(["all", "Delivery", "Flight"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border cursor-pointer ${
              filter === f
                ? "bg-accent-100 text-accent-800 border-accent-300"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {filtered.length === 0 && <EmptyState icon="package" title="No orders yet" />}
        {filtered.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
            <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
              <Icon name={r.icon as never} size={16} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs text-accent-700 font-semibold">{r.vertical}</span>
              <span className="block text-sm font-medium truncate">{r.title}</span>
              <span className="block text-xs text-neutral-600">
                {r.ref} · {r.who} {r.cc ? `· ${r.cc}` : ""} · {r.date}
              </span>
            </span>
            <span className="text-sm font-medium">{r.amount}</span>
            <Tag variant={statusVariant(r.status)}>{r.status}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
