"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  listOrders,
  cancelOrder,
  usdCentsToStr,
  nairaCentsToStr,
  fmtAmount,
  type CryptoOrderRow,
} from "@/lib/crypto";

export function OpenOrders({ refreshKey }: { refreshKey?: number }) {
  const toast = useToast();
  const [orders, setOrders] = React.useState<CryptoOrderRow[] | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    listOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await cancelOrder(id);
      load();
      toast("Order cancelled.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't cancel that order.", "error");
    } finally {
      setCancellingId(null);
    }
  }

  const open = orders?.filter((o) => o.status === "OPEN") ?? [];

  if (!orders) return <Skeleton className="h-16 w-full rounded-lg" />;
  if (open.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Open orders</span>
      {open.map((o) => (
        <div
          key={o.id}
          className="flex items-center justify-between gap-2 py-2 border-b border-divider last:border-b-0 text-sm"
        >
          <div className="flex items-center gap-2">
            <Tag variant={o.type === "LIMIT_BUY" ? "success" : "warning"}>
              {o.type === "LIMIT_BUY" ? "Buy" : "Sell"}
            </Tag>
            <span className="font-semibold">{o.assetSymbol}</span>
            <span className="text-neutral-600">
              @ {usdCentsToStr(o.limitPriceUsdCents)}
              {o.type === "LIMIT_BUY" && o.nairaAmountCents != null && ` · ${nairaCentsToStr(o.nairaAmountCents)}`}
              {o.type === "LIMIT_SELL" && o.amount != null && ` · ${fmtAmount(o.amount)} ${o.assetSymbol}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCancel(o.id)}
            disabled={cancellingId === o.id}
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-error cursor-pointer bg-transparent border-none p-1"
          >
            <Icon name="x" size={13} />
            {cancellingId === o.id ? "Cancelling…" : "Cancel"}
          </button>
        </div>
      ))}
    </div>
  );
}
