"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Tag } from "@/components/ui/tag";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import {
  getPayments,
  topUpWallet,
  withdrawWallet,
  addCard,
  centsToUsd,
  type PaymentsResponse,
} from "@/lib/account";
import { useFieldErrors } from "@/lib/use-field-errors";

type CardField = "last4" | "expiryMonth" | "expiryYear";

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["completed", "paid", "success"].includes(s)) return "success";
  if (["pending", "processing"].includes(s)) return "warning";
  if (["failed", "declined"].includes(s)) return "error";
  return "neutral";
}

export default function PaymentsPage() {
  const [data, setData] = React.useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState("");
  const [busy, setBusy] = React.useState<"topup" | "withdraw" | null>(null);
  const [walletError, setWalletError] = React.useState<string | null>(null);
  const [showCardForm, setShowCardForm] = React.useState(false);
  const [cardForm, setCardForm] = React.useState({
    brand: "Visa" as "Visa" | "Mastercard" | "Amex",
    last4: "",
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
  });
  const [cardError, setCardError] = React.useState<string | null>(null);
  const [savingCard, setSavingCard] = React.useState(false);
  const { errors, setFieldError, validateAll } = useFieldErrors<CardField>();
  const toast = useToast();

  const cardValidators: Record<CardField, () => string | undefined> = {
    last4: () => (/^\d{4}$/.test(cardForm.last4) ? undefined : "Enter the last 4 digits"),
    expiryMonth: () =>
      cardForm.expiryMonth >= 1 && cardForm.expiryMonth <= 12 ? undefined : "Enter a valid month",
    expiryYear: () =>
      cardForm.expiryYear >= new Date().getFullYear() ? undefined : "Enter a valid year",
  };

  const load = React.useCallback(() => {
    setLoading(true);
    getPayments()
      .then(setData)
      .catch(() => setError("Couldn't load payments."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading payments data from the server on mount is a genuine
    // sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleWallet(action: "topup" | "withdraw") {
    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents <= 0) {
      setWalletError("Enter a valid amount.");
      return;
    }
    setBusy(action);
    setWalletError(null);
    try {
      if (action === "topup") await topUpWallet(cents);
      else await withdrawWallet(cents);
      setAmount("");
      load();
      toast(action === "topup" ? "Wallet topped up." : "Withdrawal complete.", "success");
    } catch (err) {
      setWalletError(err instanceof ApiError ? err.message : "Transaction failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll(cardValidators)) return;
    setSavingCard(true);
    setCardError(null);
    try {
      await addCard(cardForm);
      setShowCardForm(false);
      setCardForm({ brand: "Visa", last4: "", expiryMonth: 1, expiryYear: new Date().getFullYear() });
      load();
      toast("Card added.", "success");
    } catch (err) {
      setCardError(err instanceof ApiError ? err.message : "Couldn't add card.");
    } finally {
      setSavingCard(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[920px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-40 h-7" />
          <Skeleton variant="text" className="w-80" />
        </div>
        <Skeleton className="h-36 w-full sm:max-w-[420px] rounded-lg" />
        <SkeletonText lines={4} />
      </div>
    );
  }
  if (error || !data) {
    return <EmptyState icon="alert" title="Couldn't load payments" description={error ?? "Something went wrong."} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[920px]">
      <PageHeader
        title="Payments"
        subtitle="Wallet balance, saved cards, and transaction history."
      />

      <Card className="sm:max-w-[420px]">
        <CardKicker>Wallet balance</CardKicker>
        <CardTitle>{centsToUsd(data.walletCents)}</CardTitle>
        {walletError && <div className="text-sm text-error">{walletError}</div>}
        <div className="flex gap-2 items-end mt-1">
          <Field label="Amount (USD)" className="flex-1">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Button variant="secondary" disabled={busy !== null} onClick={() => handleWallet("topup")}>
            {busy === "topup" ? "Adding…" : "Top up"}
          </Button>
          <Button variant="secondary" disabled={busy !== null} onClick={() => handleWallet("withdraw")}>
            {busy === "withdraw" ? "Withdrawing…" : "Withdraw"}
          </Button>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <SectionKicker>Payment methods</SectionKicker>
          <Button variant="ghost" onClick={() => setShowCardForm((v) => !v)}>
            <Icon name="plus" size={14} /> Add card
          </Button>
        </div>

        {showCardForm && (
          <form onSubmit={handleAddCard} className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-4 mb-3">
            {cardError && <div className="text-sm text-error">{cardError}</div>}
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Brand" required>
                <Select
                  value={cardForm.brand}
                  onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value as "Visa" | "Mastercard" | "Amex" })}
                >
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>Amex</option>
                </Select>
              </Field>
              <Field label="Last 4 digits" required error={errors.last4}>
                <Input
                  maxLength={4}
                  value={cardForm.last4}
                  onChange={(e) => setCardForm({ ...cardForm, last4: e.target.value.replace(/\D/g, "") })}
                  onBlur={() => setFieldError("last4", cardValidators.last4())}
                  invalid={!!errors.last4}
                />
              </Field>
              <Field label="Expiry month" required error={errors.expiryMonth}>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={cardForm.expiryMonth}
                  onChange={(e) => setCardForm({ ...cardForm, expiryMonth: Number(e.target.value) })}
                  onBlur={() => setFieldError("expiryMonth", cardValidators.expiryMonth())}
                  invalid={!!errors.expiryMonth}
                />
              </Field>
              <Field label="Expiry year" required error={errors.expiryYear}>
                <Input
                  type="number"
                  min={new Date().getFullYear()}
                  value={cardForm.expiryYear}
                  onChange={(e) => setCardForm({ ...cardForm, expiryYear: Number(e.target.value) })}
                  onBlur={() => setFieldError("expiryYear", cardValidators.expiryYear())}
                  invalid={!!errors.expiryYear}
                />
              </Field>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowCardForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCard}>
                {savingCard ? "Saving…" : "Save card"}
              </Button>
            </div>
          </form>
        )}

        {data.methods.length === 0 ? (
          <EmptyState icon="card" title="No saved payment methods" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.methods.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
                <Icon name="card" size={18} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    {m.brand} •••• {m.last4}
                  </span>
                  <span className="block text-xs text-neutral-600">
                    Expires {String(m.expiryMonth).padStart(2, "0")}/{m.expiryYear}
                  </span>
                </span>
                {m.isDefault && <Tag variant="accent">Default</Tag>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionKicker>Transactions</SectionKicker>
        {data.transactions.length === 0 ? (
          <EmptyState icon="file" title="No transactions yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Method</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.transactions.map((t, i) => (
                <Tr key={i}>
                  <Td>{t.date}</Td>
                  <Td>
                    <span className="font-medium">{t.desc}</span>
                    <span className="block text-xs text-neutral-600">{t.svc}</span>
                  </Td>
                  <Td>{t.method}</Td>
                  <Td>{t.amount}</Td>
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
