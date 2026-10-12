"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getAssets,
  getHoldings,
  getCryptoTransactions,
  getReceiveAddress,
  buyCrypto,
  sellCrypto,
  swapCrypto,
  sendCrypto,
  withdrawCrypto,
  usdCentsToStr,
  nairaCentsToStr,
  fmtAmount,
  type CryptoAsset,
  type CryptoHoldingRow,
  type CryptoTransactionRow,
} from "@/lib/crypto";

type Tab = "buy" | "sell" | "swap" | "send" | "receive" | "withdraw";

const TABS: { value: Tab; label: string }[] = [
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "swap", label: "Swap" },
  { value: "send", label: "Send" },
  { value: "receive", label: "Receive" },
  { value: "withdraw", label: "Withdraw" },
];

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (s === "completed") return "success";
  if (s === "pending") return "warning";
  if (s === "failed") return "error";
  return "neutral";
}

const TYPE_LABEL: Record<string, string> = {
  BUY: "Bought",
  SELL: "Sold",
  SWAP: "Swapped",
  SEND: "Sent",
  RECEIVE: "Received",
  WITHDRAW: "Withdrew",
};

export default function AccountCryptoPage() {
  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);
  const [holdings, setHoldings] = React.useState<CryptoHoldingRow[] | null>(null);
  const [txns, setTxns] = React.useState<CryptoTransactionRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("buy");
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const toast = useToast();

  const [buyForm, setBuyForm] = React.useState({ symbol: "", naira: "" });
  const [sellForm, setSellForm] = React.useState({ symbol: "", amount: "" });
  const [swapForm, setSwapForm] = React.useState({ from: "", to: "", amount: "" });
  const [sendForm, setSendForm] = React.useState({
    symbol: "",
    amount: "",
    target: "email" as "email" | "address",
    toEmail: "",
    toAddress: "",
  });
  const [withdrawForm, setWithdrawForm] = React.useState({ symbol: "", amount: "" });
  const [receiveSymbol, setReceiveSymbol] = React.useState("");
  const [receiveAddress, setReceiveAddress] = React.useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([getAssets(), getHoldings(), getCryptoTransactions()])
      .then(([a, h, t]) => {
        setAssets(a);
        setHoldings(h);
        setTxns(t);
        setBuyForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
        setSellForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
        setSwapForm((f) => ({
          ...f,
          from: f.from || a[0]?.symbol || "",
          to: f.to || a[1]?.symbol || "",
        }));
        setSendForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
        setWithdrawForm((f) => ({ ...f, symbol: f.symbol || a[0]?.symbol || "" }));
        setReceiveSymbol((s) => s || a[0]?.symbol || "");
      })
      .catch(() => setError("Couldn't load your crypto account."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading assets/holdings/transactions from the server on mount is a
    // genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function handleReceive() {
    setReceiveLoading(true);
    setReceiveAddress(null);
    try {
      const res = await getReceiveAddress(receiveSymbol);
      setReceiveAddress(res.address);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't generate an address.");
    } finally {
      setReceiveLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[920px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-40 h-7" />
          <Skeleton variant="text" className="w-80" />
        </div>
        <Skeleton className="h-28 w-full rounded-lg" />
        <SkeletonText lines={4} />
      </div>
    );
  }
  if (error || !assets) {
    return <EmptyState icon="alert" title="Couldn't load crypto" description={error ?? "Something went wrong."} />;
  }

  const assetOptions = assets.map((a) => (
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
    <div className="flex flex-col gap-6 max-w-[920px]">
      <PageHeader
        title="Crypto"
        subtitle="Buy, sell, swap and send crypto with live market prices."
      />

      <div>
        <SectionKicker>Your balances</SectionKicker>
        {!holdings || holdings.length === 0 ? (
          <EmptyState icon="bitcoin" title="No crypto yet" description="Buy your first asset below." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {holdings.map((h) => (
              <Card key={h.assetSymbol}>
                <CardKicker>{h.assetSymbol}</CardKicker>
                <CardTitle>{fmtAmount(h.balance)}</CardTitle>
                <div className="text-xs text-neutral-600">
                  {usdCentsToStr(h.valueUsdCents)} · {nairaCentsToStr(h.valueNairaCents)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionKicker>Trade</SectionKicker>
        <div className="flex flex-col gap-4 bg-card border border-divider rounded-lg p-4">
          <Segmented options={TABS} value={tab} onChange={(v) => { setTab(v); setFormError(null); }} name="crypto-tab" />
          {formError && <div className="text-sm text-error">{formError}</div>}

          {tab === "buy" && (
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
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end"
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
          )}

          {tab === "sell" && (
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
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end"
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
          )}

          {tab === "swap" && (
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
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-end"
            >
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

          {tab === "send" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amount = Number(sendForm.amount);
                if (!amount || amount <= 0) {
                  setFormError("Enter a valid amount.");
                  return;
                }
                const recipient =
                  sendForm.target === "email"
                    ? { toEmail: sendForm.toEmail.trim() }
                    : { toAddress: sendForm.toAddress.trim() };
                if (sendForm.target === "email" && !recipient.toEmail) {
                  setFormError("Enter a recipient email.");
                  return;
                }
                if (sendForm.target === "address" && !recipient.toAddress) {
                  setFormError("Enter a recipient address.");
                  return;
                }
                run(
                  () => sendCrypto({ assetSymbol: sendForm.symbol, amount, ...recipient }),
                  `Sent ${sendForm.symbol}.`,
                );
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Asset">
                  {ownedOptions.length === 0 ? (
                    <Select disabled>
                      <option>No balance to send</option>
                    </Select>
                  ) : (
                    <Select value={sendForm.symbol} onChange={(e) => setSendForm({ ...sendForm, symbol: e.target.value })}>
                      {ownedOptions}
                    </Select>
                  )}
                </Field>
                <Field label="Amount">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    placeholder="0.001"
                  />
                </Field>
              </div>
              <Segmented
                name="send-target"
                value={sendForm.target}
                onChange={(v) => setSendForm({ ...sendForm, target: v })}
                options={[
                  { value: "email", label: "Instanta user" },
                  { value: "address", label: "External address" },
                ]}
              />
              {sendForm.target === "email" ? (
                <Field label="Recipient email">
                  <Input
                    type="email"
                    value={sendForm.toEmail}
                    onChange={(e) => setSendForm({ ...sendForm, toEmail: e.target.value })}
                    placeholder="friend@example.com"
                  />
                </Field>
              ) : (
                <Field label="Recipient address">
                  <Input
                    value={sendForm.toAddress}
                    onChange={(e) => setSendForm({ ...sendForm, toAddress: e.target.value })}
                    placeholder="bc1q…"
                  />
                </Field>
              )}
              <Button type="submit" disabled={busy || ownedOptions.length === 0} className="self-end">
                {busy ? "Sending…" : "Send"}
              </Button>
            </form>
          )}

          {tab === "receive" && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                <Field label="Asset">
                  <Select value={receiveSymbol} onChange={(e) => { setReceiveSymbol(e.target.value); setReceiveAddress(null); }}>
                    {assetOptions}
                  </Select>
                </Field>
                <Button type="button" onClick={handleReceive} disabled={receiveLoading}>
                  {receiveLoading ? "Generating…" : "Get address"}
                </Button>
              </div>
              {receiveAddress && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg">
                  <Icon name="wallet" size={16} className="text-accent" />
                  <code className="text-sm flex-1 break-all">{receiveAddress}</code>
                </div>
              )}
            </div>
          )}

          {tab === "withdraw" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amount = Number(withdrawForm.amount);
                if (!amount || amount <= 0) {
                  setFormError("Enter a valid amount.");
                  return;
                }
                run(
                  () => withdrawCrypto({ assetSymbol: withdrawForm.symbol, amount }),
                  `Withdrew ${withdrawForm.symbol} to your Naira wallet.`,
                );
              }}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end"
            >
              <Field label="Asset" hint="Converts straight to your Naira wallet">
                {ownedOptions.length === 0 ? (
                  <Select disabled>
                    <option>No balance to withdraw</option>
                  </Select>
                ) : (
                  <Select value={withdrawForm.symbol} onChange={(e) => setWithdrawForm({ ...withdrawForm, symbol: e.target.value })}>
                    {ownedOptions}
                  </Select>
                )}
              </Field>
              <Field label="Amount">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder="0.001"
                />
              </Field>
              <Button type="submit" disabled={busy || ownedOptions.length === 0}>
                {busy ? "Withdrawing…" : "Withdraw"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div>
        <SectionKicker>Transactions</SectionKicker>
        {!txns || txns.length === 0 ? (
          <EmptyState icon="file" title="No crypto transactions yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Details</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {txns.map((t) => (
                <Tr key={t.id}>
                  <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
                  <Td>{TYPE_LABEL[t.type] ?? t.type}</Td>
                  <Td>
                    <span className="font-medium">{t.description}</span>
                    {t.nairaAmountCents != null && (
                      <span className="block text-xs text-neutral-600">
                        {nairaCentsToStr(t.nairaAmountCents)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {fmtAmount(t.amount)} {t.assetSymbol}
                    {t.counterAmount && t.counterAssetSymbol && (
                      <span className="block text-xs text-neutral-600">
                        → {fmtAmount(t.counterAmount)} {t.counterAssetSymbol}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Tag variant={statusVariant(t.status)}>{t.status}</Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
