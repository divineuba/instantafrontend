import { apiFetch } from "@/lib/api";

export interface CryptoAsset {
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
  priceUsdCents: number;
}

export interface CryptoHoldingRow {
  assetSymbol: string;
  balance: number;
  priceUsdCents: number;
  valueUsdCents: number;
  valueNairaCents: number;
}

export type CryptoTxnType = "BUY" | "SELL" | "SWAP" | "SEND" | "RECEIVE" | "WITHDRAW";
export type CryptoTxnStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface CryptoTransactionRow {
  id: string;
  type: CryptoTxnType;
  status: CryptoTxnStatus;
  assetSymbol: string;
  amount: string;
  counterAssetSymbol: string | null;
  counterAmount: string | null;
  priceUsdCents: number;
  nairaAmountCents: number | null;
  counterpartyAddress: string | null;
  counterpartyUserId: string | null;
  description: string;
  createdAt: string;
}

export function getAssets() {
  return apiFetch<CryptoAsset[]>("/crypto/assets");
}

export function getHoldings() {
  return apiFetch<CryptoHoldingRow[]>("/crypto/holdings");
}

export function getCryptoTransactions() {
  return apiFetch<CryptoTransactionRow[]>("/crypto/transactions");
}

export function getReceiveAddress(assetSymbol: string) {
  return apiFetch<{ assetSymbol: string; address: string }>(
    `/crypto/receive/${encodeURIComponent(assetSymbol)}`,
  );
}

export function buyCrypto(input: { assetSymbol: string; nairaAmountCents: number }) {
  return apiFetch<CryptoTransactionRow>("/crypto/buy", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sellCrypto(input: { assetSymbol: string; amount: number }) {
  return apiFetch<CryptoTransactionRow>("/crypto/sell", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function swapCrypto(input: { fromSymbol: string; toSymbol: string; amount: number }) {
  return apiFetch<CryptoTransactionRow>("/crypto/swap", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function sendCrypto(input: {
  assetSymbol: string;
  amount: number;
  toEmail?: string;
  toAddress?: string;
}) {
  return apiFetch<CryptoTransactionRow>("/crypto/send", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function withdrawCrypto(input: { assetSymbol: string; amount: number }) {
  return apiFetch<CryptoTransactionRow>("/crypto/withdraw", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function usdCentsToStr(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function nairaCentsToStr(cents: number) {
  return `₦${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtAmount(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}
