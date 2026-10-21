"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { getAssets, getReceiveAddress, type CryptoAsset } from "@/lib/crypto";

export default function CryptoReceivePage() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);
  const [symbol, setSymbol] = React.useState("");
  const [address, setAddress] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAssets().then((a) => {
      setAssets(a);
      setSymbol((s) => s || a[0]?.symbol || "");
    });
  }, []);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    setAddress(null);
    try {
      const res = await getReceiveAddress(symbol);
      setAddress(res.address);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't generate an address.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header business="crypto" active="receive" />
      <main className="flex-1">
        <div className="ins-container py-12 max-w-[520px] mx-auto">
          <div className="flex flex-col gap-1.5 mb-6">
            <h1 className="text-3xl font-semibold">Receive crypto</h1>
            <p className="text-neutral-700 m-0">
              Generate a deposit address for any supported asset.
            </p>
          </div>

          {!authLoading && !user ? (
            <Card className="items-start gap-3">
              <Tag variant="accent">Sign in required</Tag>
              <CardTitle>Sign in to receive crypto</CardTitle>
              <LinkButton href={`/login?next=${encodeURIComponent(pathname ?? "/crypto/receive")}`} variant="primary">
                Sign in
              </LinkButton>
            </Card>
          ) : !assets ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : (
            <Card className="gap-4">
              {error && <div className="text-sm text-error">{error}</div>}
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                <Field label="Asset">
                  <Select
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(e.target.value);
                      setAddress(null);
                    }}
                  >
                    {assets.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.symbol} — {a.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button type="button" onClick={handleGenerate} disabled={busy}>
                  {busy ? "Generating…" : "Get address"}
                </Button>
              </div>
              {address && (
                <div className="flex flex-col gap-3 items-center">
                  <div className="p-3 bg-white border border-divider rounded-lg">
                    <QRCodeSVG value={address} size={180} />
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg w-full">
                    <Icon name="wallet" size={16} className="text-accent shrink-0" />
                    <code className="text-sm flex-1 break-all">{address}</code>
                  </div>
                  <p className="text-xs text-neutral-600 m-0">
                    Only send {symbol} to this address. Deposits are credited automatically.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
