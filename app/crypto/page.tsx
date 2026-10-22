"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssets, priceToStr, type CryptoAsset } from "@/lib/crypto";
import { PriceChart } from "@/components/crypto/price-chart";
import { Select } from "@/components/ui/field";

const ANSWERS: { icon: IconName; q: string; title: string; body: string }[] = [
  {
    icon: "bitcoin",
    q: "What",
    title: "6 major assets",
    body: "Bitcoin, Ethereum, USDT, USDC, BNB and Solana, with more on the way.",
  },
  {
    icon: "chart",
    q: "Prices",
    title: "Live market rates",
    body: "Prices update from the live market every minute, not a fixed spread.",
  },
  {
    icon: "wallet",
    q: "Cash out",
    title: "Straight to Naira",
    body: "Sell or withdraw any balance directly to your Instanta wallet.",
  },
  {
    icon: "swap",
    q: "Trading",
    title: "Buy, sell, swap, send",
    body: "Move between assets or send to another Instanta user instantly.",
  },
];

function PriceTicker() {
  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);

  React.useEffect(() => {
    let active = true;
    getAssets()
      .then((a) => {
        if (active) setAssets(a);
      })
      .catch(() => {
        if (active) setAssets([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-6 flex flex-col gap-3.5 bg-card border border-divider rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <span className="text-xl font-semibold">Live prices</span>
        <Tag variant="accent">Updated every minute</Tag>
      </div>
      <div className="flex flex-col gap-1">
        {!assets &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        {assets?.map((a) => (
          <div
            key={a.symbol}
            className="flex items-center justify-between py-2 border-b border-divider last:border-b-0"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Icon name="bitcoin" size={16} className="text-accent" />
              {a.symbol}
              <span className="text-neutral-600 font-normal">{a.name}</span>
            </span>
            <span className="text-sm font-semibold">
              {priceToStr(a.priceUsdCents)}
            </span>
          </div>
        ))}
      </div>
      <LinkButton href="/crypto/exchange" variant="primary" className="h-10">
        Open exchange <Icon name="arrow" size={14} />
      </LinkButton>
    </div>
  );
}

function ChartSection() {
  const [assets, setAssets] = React.useState<CryptoAsset[] | null>(null);
  const [symbol, setSymbol] = React.useState("");

  React.useEffect(() => {
    let active = true;
    getAssets()
      .then((a) => {
        if (active) {
          setAssets(a);
          setSymbol((s) => s || a[0]?.symbol || "");
        }
      })
      .catch(() => {
        if (active) setAssets([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!symbol) return null;

  return (
    <section className="ins-container pt-24">
      <div className="p-6 bg-card border border-divider rounded-xl shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <span className="text-xl font-semibold">Market chart</span>
          <Select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-auto"
          >
            {assets?.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol} — {a.name}
              </option>
            ))}
          </Select>
        </div>
        <PriceChart assetSymbol={symbol} />
      </div>
    </section>
  );
}

export default function CryptoHomePage() {
  return (
    <>
      <Header business="crypto" active="home" />
      <main className="flex-1">
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1fr)_460px] gap-14 items-start">
          <div className="flex flex-col gap-5 pt-3">
            <span className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
              Instanta Crypto
            </span>
            <h1 className="text-[clamp(36px,4.8vw,64px)] leading-[1.05]">
              Trade crypto. Cash out in Naira.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg">
              Buy, sell, swap and send Bitcoin, Ethereum and more with live
              market prices, then withdraw straight to your Instanta wallet.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton
                href="/crypto/exchange"
                variant="primary"
                className="text-base px-6 py-3"
              >
                Open exchange
              </LinkButton>
              <LinkButton
                href="/crypto/receive"
                variant="secondary"
                className="text-base px-6 py-3"
              >
                Receive crypto
              </LinkButton>
            </div>
          </div>
          <PriceTicker />
        </section>

        {/* Answers */}
        <section className="ins-container pt-24">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {ANSWERS.map((a) => (
              <div key={a.title} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-start text-accent">
                  <Icon name={a.icon} size={28} />
                  <span className="text-xs text-neutral-600">{a.q}</span>
                </div>
                <div className="text-xl font-semibold leading-tight">
                  {a.title}
                </div>
                <p className="text-sm text-neutral-700 m-0">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        <ChartSection />

        {/* CTA band */}
        <section className="ins-container pt-24 pb-24">
          <div className="bg-accent-900 text-white p-6 sm:p-10 rounded-2xl flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="mr-auto">
              <div className="text-2xl md:text-4xl font-semibold leading-tight">
                Ready to trade?
              </div>
              <div className="text-[15px] text-accent-200 mt-1.5">
                Sign in and buy your first asset in under a minute.
              </div>
            </div>
            <Link
              href="/crypto/exchange"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-[7px] whitespace-nowrap cursor-pointer font-semibold text-sm rounded-[0.4rem] border border-white bg-white text-accent-900 hover:bg-accent-100 h-11 px-4 no-underline"
            >
              Open exchange
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
