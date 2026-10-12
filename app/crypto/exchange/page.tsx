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
  usdCentsToStr,
  fmtAmount,
  type CryptoAsset,
  type CryptoHoldingRow,
} from "@/lib/crypto";

type Tab = "buy" | "sell" | "swap";

export default function CryptoExchangePage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const toast = useToast();

  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);
  const [holdings, setHoldings] = React.useState<CryptoHoldingRow[] | null>(null);
  const [tab, setTab] = React.useState<Tab>("buy");
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [buyForm, setBuyForm] = React.useState({ symbol: "", naira: "" });
  const [sellForm, setSellForm] = React.useState({ symbol: "", amount: "" });
  const [swapForm, setSwapForm] = React.useState({ from: "", to: "", amount: "" });

  const load = React.useCallback(() => {
    getAssets().then((a) => {
      setAssets(a);
      setBuyForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
      setSwapForm((f) => ({ ...f, from: f.from || a[0]?.symbol || "", to: f.to || a[1]?.symbol || "" }));
    });
    if (user) {
      getHoldings().then((h) => {
        setHoldings(h);
        setSellForm((f) => ({ ...f, symbol: f.symbol || h[0]?.assetSymbol || "" }));
      });
    }
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  function priceOf(symbol: string) {
    return assets?.find((a) => a.symbol === symbol)?.priceUsdCents ?? 0;
  }

  async function run(action: () => Promise<unknown>, successMsg: string) {
    setBusy(true);
    setFormError(null);
    try {
      await action();
      load();
      toast(successMsg, "success");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "That didn't go through.");
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
              <p className="text-neutral-700 m-0">Buy, sell and swap crypto at live market prices.</p>
            </div>

            {!authLoading && !user ? (
              <Card className="items-start gap-3">
                <Tag variant="accent">Sign in required</Tag>
                <CardTitle>Sign in to trade</CardTitle>
                <p className="text-sm text-neutral-700 m-0">
                  Create an account or sign in to buy, sell and swap crypto.
                </p>
                <LinkButton href={`/login?next=${encodeURIComponent(pathname ?? "/crypto/exchange")}`} variant="primary">
                  Sign in
                </LinkButton>
              </Card>
            ) : (
              <Card className="gap-4">
                <Segmented
                  name="exchange-tab"
                  value={tab}
                  onChange={(v) => { setTab(v); setFormError(null); }}
                  options={[
                    { value: "buy", label: "Buy" },
                    { value: "sell", label: "Sell" },
                    { value: "swap", label: "Swap" },
                  ]}
                />
                {formError && <div className="text-sm text-error">{formError}</div>}

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
                        () => buyCrypto({ assetSymbol: buyForm.symbol, nairaAmountCents: cents }),
                        `Bought ${buyForm.symbol}.`,
                      );
                    }}
                    className="flex flex-col gap-3"
                  >
                    <Field label="Asset">
                      <Select value={buyForm.symbol} onChange={(e) => setBuyForm({ ...buyForm, symbol: e.target.value })}>
                        {assetOptions}
                      </Select>
                    </Field>
                    <Field label="Amount (NGN)" hint={buyForm.symbol ? `Price: ${usdCentsToStr(priceOf(buyForm.symbol))}` : undefined}>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={buyForm.naira}
                        onChange={(e) => setBuyForm({ ...buyForm, naira: e.target.value })}
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
                        () => sellCrypto({ assetSymbol: sellForm.symbol, amount }),
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
                        <Select value={sellForm.symbol} onChange={(e) => setSellForm({ ...sellForm, symbol: e.target.value })}>
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
                        onChange={(e) => setSellForm({ ...sellForm, amount: e.target.value })}
                        placeholder="0.001"
                      />
                    </Field>
                    <Button type="submit" disabled={busy || ownedOptions.length === 0}>
                      {busy ? "Selling…" : "Sell"}
                    </Button>
                  </form>
                ) : (
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
                        () => swapCrypto({ fromSymbol: swapForm.from, toSymbol: swapForm.to, amount }),
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
                          <Select value={swapForm.from} onChange={(e) => setSwapForm({ ...swapForm, from: e.target.value })}>
                            {ownedOptions}
                          </Select>
                        )}
                      </Field>
                      <Field label="To">
                        <Select value={swapForm.to} onChange={(e) => setSwapForm({ ...swapForm, to: e.target.value })}>
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
                        onChange={(e) => setSwapForm({ ...swapForm, amount: e.target.value })}
                        placeholder="0.001"
                      />
                    </Field>
                    <Button type="submit" disabled={busy || ownedOptions.length === 0}>
                      {busy ? "Swapping…" : "Swap"}
                    </Button>
                  </form>
                )}

                <div className="flex gap-4 text-sm pt-1 border-t border-divider">
                  <Link href="/crypto/send" className="text-accent-700 no-underline font-medium pt-3">
                    Send crypto →
                  </Link>
                  <Link href="/crypto/receive" className="text-accent-700 no-underline font-medium pt-3">
                    Receive crypto →
                  </Link>
                  <Link href="/account/crypto" className="text-accent-700 no-underline font-medium pt-3">
                    Full history →
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <Card className="gap-3">
            <div className="flex justify-between items-center">
              <CardKicker>Live prices</CardKicker>
            </div>
            <div className="flex flex-col gap-1">
              {!assets &&
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-md" />)}
              {assets?.map((a) => (
                <div key={a.symbol} className="flex items-center justify-between py-1.5 border-b border-divider last:border-b-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="bitcoin" size={14} className="text-accent" />
                    {a.symbol}
                  </span>
                  <span className="text-sm font-semibold">{usdCentsToStr(a.priceUsdCents)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
