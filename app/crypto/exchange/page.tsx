"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Card, CardKicker, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getAssets,
  getHoldings,
  buyCrypto,
  sellCrypto,
  swapCrypto,
  createOrder,
  usdCentsToStr,
  priceToStr,
  fmtAmount,
  type CryptoAsset,
  type CryptoHoldingRow,
} from "@/lib/crypto";
import { PriceChart } from "@/components/crypto/price-chart";
import { OpenOrders } from "@/components/crypto/open-orders";
import { PriceAlerts } from "@/components/crypto/price-alerts";

type Tab = "buy" | "sell" | "swap" | "limit";

export default function CryptoExchangePage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const toast = useToast();

  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);
  const [holdings, setHoldings] = React.useState<CryptoHoldingRow[] | null>(
    null,
  );
  const [tab, setTab] = React.useState<Tab>("buy");
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [buyForm, setBuyForm] = React.useState({ symbol: "", naira: "" });
  const [sellForm, setSellForm] = React.useState({ symbol: "", amount: "" });
  const [swapForm, setSwapForm] = React.useState({
    from: "",
    to: "",
    amount: "",
  });
  const [limitForm, setLimitForm] = React.useState({
    side: "LIMIT_BUY" as "LIMIT_BUY" | "LIMIT_SELL",
    symbol: "",
    limitPrice: "",
    amount: "",
  });
  const [ordersRefreshKey, setOrdersRefreshKey] = React.useState(0);

  const load = React.useCallback(() => {
    getAssets().then((a) => {
      setAssets(a);
      setBuyForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
      setSwapForm((f) => ({
        ...f,
        from: f.from || a[0]?.symbol || "",
        to: f.to || a[1]?.symbol || "",
      }));
      setLimitForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
    });
    if (user) {
      getHoldings().then((h) => {
        setHoldings(h);
        setSellForm((f) => ({
          ...f,
          symbol: f.symbol || h[0]?.assetSymbol || "",
        }));
      });
    }
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  function priceOf(symbol: string) {
    return assets?.find((a) => a.symbol === symbol)?.priceUsdCents ?? null;
  }

  const chartSymbol =
    (tab === "buy"
      ? buyForm.symbol
      : tab === "sell"
        ? sellForm.symbol
        : tab === "swap"
          ? swapForm.from
          : limitForm.symbol) ||
    assets?.[0]?.symbol ||
    "";

  async function run<T>(
    action: () => Promise<T>,
    successMsg: string | ((result: T) => string),
  ) {
    setBusy(true);
    setFormError(null);
    try {
      const result = await action();
      load();
      setOrdersRefreshKey((k) => k + 1);
      const base =
        typeof successMsg === "function" ? successMsg(result) : successMsg;
      const fee = (result as { feeUsdCents?: number }).feeUsdCents;
      toast(fee ? `${base} Fee: ${usdCentsToStr(fee)}.` : base, "success");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "That didn't go through.",
      );
    } finally {
      setBusy(false);
    }
  }

  const assetOptions = assets?.map((a) => (
    <option key={a.symbol} value={a.symbol}>
      {a.symbol} — {a.name}
    </option>
  ));
  const ownedOptions = (holdings ?? [])
    .filter((h) => Number(h.balance) > 0)
    .map((h) => (
      <option key={h.assetSymbol} value={h.assetSymbol}>
        {h.assetSymbol} — {fmtAmount(h.balance)} available
      </option>
    ));

  return (
    <>
      <Header business="crypto" active="exchange" />
      <main className="flex-1">
        <div className="ins-container py-12 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl font-semibold">Exchange</h1>
              <p className="text-neutral-700 m-0">
                Buy, sell and swap crypto at live market prices.
              </p>
            </div>

            {chartSymbol && (
              <Card className="gap-3">
                <CardKicker>{chartSymbol}</CardKicker>
                <PriceChart assetSymbol={chartSymbol} />
              </Card>
            )}

            {!authLoading && !user ? (
              <Card className="items-start gap-3">
                <Tag variant="accent">Sign in required</Tag>
                <CardTitle>Sign in to trade</CardTitle>
                <p className="text-sm text-neutral-700 m-0">
                  Create an account or sign in to buy, sell and swap crypto.
                </p>
                <LinkButton
                  href={`/login?next=${encodeURIComponent(pathname ?? "/crypto/exchange")}`}
                  variant="primary"
                >
                  Sign in
                </LinkButton>
              </Card>
            ) : (
              <Card className="gap-4">
                <Segmented
                  name="exchange-tab"
                  value={tab}
                  onChange={(v) => {
                    setTab(v);
                    setFormError(null);
                  }}
                  options={[
                    { value: "buy", label: "Buy" },
                    { value: "sell", label: "Sell" },
                    { value: "swap", label: "Swap" },
                    { value: "limit", label: "Limit" },
                  ]}
                />
                {formError && (
                  <div className="text-sm text-error">{formError}</div>
                )}

                {!assets ? (
                  <Skeleton className="h-28 w-full rounded-lg" />
                ) : tab === "buy" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const cents = Math.round(Number(buyForm.naira) * 100);
                      if (!cents || cents <= 0) {
                        setFormError("Enter a valid Naira amount.");
                        return;
                      }
                      run(
                        () =>
                          buyCrypto({
                            assetSymbol: buyForm.symbol,
                            nairaAmountCents: cents,
                          }),
                        `Bought ${buyForm.symbol}.`,
                      );
                    }}
                    className="flex flex-col gap-3"
                  >
                    <Field label="Asset">
                      <Select
                        value={buyForm.symbol}
                        onChange={(e) =>
                          setBuyForm({ ...buyForm, symbol: e.target.value })
                        }
                      >
                        {assetOptions}
                      </Select>
                    </Field>
                    <Field
                      label="Amount (NGN)"
                      hint={
                        buyForm.symbol
                          ? `Price: ${priceToStr(priceOf(buyForm.symbol))}`
                          : undefined
                      }
                    >
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={buyForm.naira}
                        onChange={(e) =>
                          setBuyForm({ ...buyForm, naira: e.target.value })
                        }
                        placeholder="50000"
                      />
                    </Field>
                    <Button type="submit" disabled={busy}>
                      {busy ? "Buying…" : "Buy"}
                    </Button>
                  </form>
                ) : tab === "sell" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amount = Number(sellForm.amount);
                      if (!amount || amount <= 0) {
                        setFormError("Enter a valid amount.");
                        return;
                      }
                      run(
                        () =>
                          sellCrypto({ assetSymbol: sellForm.symbol, amount }),
                        `Sold ${sellForm.symbol}.`,
                      );
                    }}
                    className="flex flex-col gap-3"
                  >
                    <Field label="Asset">
                      {ownedOptions.length === 0 ? (
                        <Select disabled>
                          <option>No balance to sell</option>
                        </Select>
                      ) : (
                        <Select
                          value={sellForm.symbol}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, symbol: e.target.value })
                          }
                        >
                          {ownedOptions}
                        </Select>
                      )}
                    </Field>
                    <Field label="Amount">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={sellForm.amount}
                        onChange={(e) =>
                          setSellForm({ ...sellForm, amount: e.target.value })
                        }
                        placeholder="0.001"
                      />
                    </Field>
                    <Button
                      type="submit"
                      disabled={busy || ownedOptions.length === 0}
                    >
                      {busy ? "Selling…" : "Sell"}
                    </Button>
                  </form>
                ) : tab === "swap" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amount = Number(swapForm.amount);
                      if (!amount || amount <= 0) {
                        setFormError("Enter a valid amount.");
                        return;
                      }
                      if (swapForm.from === swapForm.to) {
                        setFormError("Choose two different assets.");
                        return;
                      }
                      run(
                        () =>
                          swapCrypto({
                            fromSymbol: swapForm.from,
                            toSymbol: swapForm.to,
                            amount,
                          }),
                        `Swapped ${swapForm.from} for ${swapForm.to}.`,
                      );
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="From">
                        {ownedOptions.length === 0 ? (
                          <Select disabled>
                            <option>No balance</option>
                          </Select>
                        ) : (
                          <Select
                            value={swapForm.from}
                            onChange={(e) =>
                              setSwapForm({ ...swapForm, from: e.target.value })
                            }
                          >
                            {ownedOptions}
                          </Select>
                        )}
                      </Field>
                      <Field label="To">
                        <Select
                          value={swapForm.to}
                          onChange={(e) =>
                            setSwapForm({ ...swapForm, to: e.target.value })
                          }
                        >
                          {assetOptions}
                        </Select>
                      </Field>
                    </div>
                    <Field label="Amount">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={swapForm.amount}
                        onChange={(e) =>
                          setSwapForm({ ...swapForm, amount: e.target.value })
                        }
                        placeholder="0.001"
                      />
                    </Field>
                    <Button
                      type="submit"
                      disabled={busy || ownedOptions.length === 0}
                    >
                      {busy ? "Swapping…" : "Swap"}
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const limitPriceUsdCents = Math.round(
                        Number(limitForm.limitPrice) * 100,
                      );
                      if (!limitPriceUsdCents || limitPriceUsdCents <= 0) {
                        setFormError("Enter a valid limit price.");
                        return;
                      }
                      if (limitForm.side === "LIMIT_BUY") {
                        const nairaAmountCents = Math.round(
                          Number(limitForm.amount) * 100,
                        );
                        if (!nairaAmountCents || nairaAmountCents <= 0) {
                          setFormError("Enter a valid Naira amount.");
                          return;
                        }
                        run(
                          () =>
                            createOrder({
                              type: "LIMIT_BUY",
                              assetSymbol: limitForm.symbol,
                              limitPriceUsdCents,
                              nairaAmountCents,
                            }),
                          `Limit buy order placed for ${limitForm.symbol}.`,
                        );
                      } else {
                        const amount = Number(limitForm.amount);
                        if (!amount || amount <= 0) {
                          setFormError("Enter a valid amount.");
                          return;
                        }
                        run(
                          () =>
                            createOrder({
                              type: "LIMIT_SELL",
                              assetSymbol: limitForm.symbol,
                              limitPriceUsdCents,
                              amount,
                            }),
                          `Limit sell order placed for ${limitForm.symbol}.`,
                        );
                      }
                    }}
                    className="flex flex-col gap-3"
                  >
                    <Segmented
                      name="limit-side"
                      value={limitForm.side}
                      onChange={(v) => setLimitForm({ ...limitForm, side: v })}
                      options={[
                        { value: "LIMIT_BUY", label: "Buy" },
                        { value: "LIMIT_SELL", label: "Sell" },
                      ]}
                    />
                    <Field label="Asset">
                      {limitForm.side === "LIMIT_SELL" &&
                      ownedOptions.length === 0 ? (
                        <Select disabled>
                          <option>No balance to sell</option>
                        </Select>
                      ) : (
                        <Select
                          value={limitForm.symbol}
                          onChange={(e) =>
                            setLimitForm({
                              ...limitForm,
                              symbol: e.target.value,
                            })
                          }
                        >
                          {limitForm.side === "LIMIT_BUY"
                            ? assetOptions
                            : ownedOptions}
                        </Select>
                      )}
                    </Field>
                    <Field
                      label="Limit price (USD)"
                      hint={
                        limitForm.symbol
                          ? `Market: ${priceToStr(priceOf(limitForm.symbol))}`
                          : undefined
                      }
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={limitForm.limitPrice}
                        onChange={(e) =>
                          setLimitForm({
                            ...limitForm,
                            limitPrice: e.target.value,
                          })
                        }
                        placeholder="65000"
                      />
                    </Field>
                    <Field
                      label={
                        limitForm.side === "LIMIT_BUY"
                          ? "Amount (NGN)"
                          : "Amount"
                      }
                    >
                      <Input
                        type="number"
                        min="0"
                        step={limitForm.side === "LIMIT_BUY" ? "1" : "any"}
                        value={limitForm.amount}
                        onChange={(e) =>
                          setLimitForm({ ...limitForm, amount: e.target.value })
                        }
                        placeholder={
                          limitForm.side === "LIMIT_BUY" ? "50000" : "0.001"
                        }
                      />
                    </Field>
                    <Button
                      type="submit"
                      disabled={
                        busy ||
                        (limitForm.side === "LIMIT_SELL" &&
                          ownedOptions.length === 0)
                      }
                    >
                      {busy ? "Placing…" : "Place order"}
                    </Button>
                    <p className="text-xs text-neutral-600 m-0">
                      Funds are held until the order fills or is cancelled.
                    </p>
                  </form>
                )}

                <OpenOrders refreshKey={ordersRefreshKey} />

                <div className="flex gap-4 text-sm pt-1 border-t border-divider">
                  <Link
                    href="/crypto/send"
                    className="text-accent-700 no-underline font-medium pt-3"
                  >
                    Send crypto →
                  </Link>
                  <Link
                    href="/crypto/receive"
                    className="text-accent-700 no-underline font-medium pt-3"
                  >
                    Receive crypto →
                  </Link>
                  <Link
                    href="/account/crypto"
                    className="text-accent-700 no-underline font-medium pt-3"
                  >
                    Full history →
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <Card className="gap-3">
              <div className="flex justify-between items-center">
                <CardKicker>Live prices</CardKicker>
              </div>
              <div className="flex flex-col gap-1">
                {!assets &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                  ))}
                {assets?.map((a) => (
                  <div
                    key={a.symbol}
                    className="flex items-center justify-between py-1.5 border-b border-divider last:border-b-0"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon name="bitcoin" size={14} className="text-accent" />
                      {a.symbol}
                    </span>
                    <span className="text-sm font-semibold">
                      {priceToStr(a.priceUsdCents)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {user && (
              <Card className="gap-3">
                <PriceAlerts assets={assets} />
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
