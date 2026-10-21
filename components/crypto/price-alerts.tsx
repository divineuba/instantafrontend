"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  listAlerts,
  createAlert,
  cancelAlert,
  usdCentsToStr,
  type CryptoPriceAlertRow,
  type CryptoAsset,
} from "@/lib/crypto";

export function PriceAlerts({ assets }: { assets: CryptoAsset[] | null }) {
  const toast = useToast();
  const [alerts, setAlerts] = React.useState<CryptoPriceAlertRow[] | null>(null);
  const [symbol, setSymbol] = React.useState("");
  const [direction, setDirection] = React.useState<"ABOVE" | "BELOW">("ABOVE");
  const [target, setTarget] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    listAlerts().then(setAlerts).catch(() => setAlerts([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!symbol && assets && assets.length > 0) setSymbol(assets[0].symbol);
  }, [assets, symbol]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(target) * 100);
    if (!cents || cents <= 0) {
      setError("Enter a valid target price.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createAlert({ assetSymbol: symbol, direction, targetUsdCents: cents });
      setTarget("");
      load();
      toast("Alert created.", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create that alert.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await cancelAlert(id);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't cancel that alert.", "error");
    } finally {
      setCancellingId(null);
    }
  }

  const active = alerts?.filter((a) => !a.triggeredAt && !a.cancelledAt) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon name="bell" size={15} className="text-accent" />
        <span className="text-sm font-semibold">Price alerts</span>
      </div>
      <form onSubmit={handleCreate} className="flex flex-col gap-2.5">
        {error && <div className="text-sm text-error">{error}</div>}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Asset">
            <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {assets?.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Direction">
            <Segmented
              name="alert-direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: "ABOVE", label: "Above" },
                { value: "BELOW", label: "Below" },
              ]}
            />
          </Field>
        </div>
        <Field label="Target price (USD)">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="65000"
          />
        </Field>
        <Button type="submit" variant="secondary" disabled={busy || !symbol}>
          {busy ? "Creating…" : "Create alert"}
        </Button>
      </form>

      {!alerts ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : active.length > 0 ? (
        <div className="flex flex-col gap-1 pt-1 border-t border-divider">
          {active.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
              <span>
                <span className="font-semibold">{a.assetSymbol}</span>{" "}
                <Tag variant="neutral">{a.direction === "ABOVE" ? "≥" : "≤"} {usdCentsToStr(a.targetUsdCents)}</Tag>
              </span>
              <button
                type="button"
                onClick={() => handleCancel(a.id)}
                disabled={cancellingId === a.id}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-error cursor-pointer bg-transparent border-none p-1"
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
