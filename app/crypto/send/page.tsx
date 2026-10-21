"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import { getHoldings, sendCrypto, fmtAmount, usdCentsToStr, type CryptoHoldingRow } from "@/lib/crypto";

export default function CryptoSendPage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const toast = useToast();

  const [holdings, setHoldings] = React.useState<CryptoHoldingRow[] | null>(null);
  const [form, setForm] = React.useState({
    symbol: "",
    amount: "",
    target: "email" as "email" | "address",
    toEmail: "",
    toAddress: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const load = React.useCallback(() => {
    if (!user) return;
    getHoldings().then((h) => {
      setHoldings(h);
      setForm((f) => ({ ...f, symbol: f.symbol || h[0]?.assetSymbol || "" }));
    });
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  const owned = (holdings ?? []).filter((h) => Number(h.balance) > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    const recipient =
      form.target === "email" ? { toEmail: form.toEmail.trim() } : { toAddress: form.toAddress.trim() };
    if (form.target === "email" && !recipient.toEmail) {
      setFormError("Enter a recipient email.");
      return;
    }
    if (form.target === "address" && !recipient.toAddress) {
      setFormError("Enter a recipient address.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const result = await sendCrypto({ assetSymbol: form.symbol, amount, ...recipient });
      setSent(true);
      load();
      toast(
        result.feeUsdCents
          ? `Sent ${form.symbol}. Fee: ${usdCentsToStr(result.feeUsdCents)}.`
          : `Sent ${form.symbol}.`,
        "success",
      );
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "That didn't go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header business="crypto" active="send" />
      <main className="flex-1">
        <div className="ins-container py-12 max-w-[520px] mx-auto">
          <div className="flex flex-col gap-1.5 mb-6">
            <h1 className="text-3xl font-semibold">Send crypto</h1>
            <p className="text-neutral-700 m-0">
              Send to another Instanta user by email, or to an external wallet address.
            </p>
          </div>

          {!authLoading && !user ? (
            <Card className="items-start gap-3">
              <Tag variant="accent">Sign in required</Tag>
              <CardTitle>Sign in to send crypto</CardTitle>
              <LinkButton href={`/login?next=${encodeURIComponent(pathname ?? "/crypto/send")}`} variant="primary">
                Sign in
              </LinkButton>
            </Card>
          ) : !holdings ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : sent ? (
            <Card className="items-start gap-3">
              <Tag variant="success">Sent</Tag>
              <CardTitle>Transfer complete</CardTitle>
              <p className="text-sm text-neutral-700 m-0">Check your transaction history for details.</p>
              <Button variant="secondary" onClick={() => setSent(false)}>
                Send another
              </Button>
            </Card>
          ) : owned.length === 0 ? (
            <Card className="items-start gap-3">
              <CardTitle>No balance to send</CardTitle>
              <p className="text-sm text-neutral-700 m-0">Buy some crypto first, then come back to send it.</p>
              <LinkButton href="/crypto/exchange" variant="primary">
                Open exchange
              </LinkButton>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {formError && <div className="text-sm text-error">{formError}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Asset">
                    <Select value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}>
                      {owned.map((h) => (
                        <option key={h.assetSymbol} value={h.assetSymbol}>
                          {h.assetSymbol} — {fmtAmount(h.balance)} available
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Amount">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0.001"
                    />
                  </Field>
                </div>
                <Segmented
                  name="send-target"
                  value={form.target}
                  onChange={(v) => setForm({ ...form, target: v })}
                  options={[
                    { value: "email", label: "Instanta user" },
                    { value: "address", label: "External address" },
                  ]}
                />
                {form.target === "email" ? (
                  <Field label="Recipient email">
                    <Input
                      type="email"
                      value={form.toEmail}
                      onChange={(e) => setForm({ ...form, toEmail: e.target.value })}
                      placeholder="friend@example.com"
                    />
                  </Field>
                ) : (
                  <Field label="Recipient address">
                    <Input
                      value={form.toAddress}
                      onChange={(e) => setForm({ ...form, toAddress: e.target.value })}
                      placeholder="bc1q…"
                    />
                  </Field>
                )}
                <Button type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
