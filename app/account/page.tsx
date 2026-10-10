"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getOverview, centsToUsd, type AccountOverview } from "@/lib/account";
import { useAuth } from "@/lib/auth-context";
import { OnboardingChecklist } from "@/components/account/onboarding-checklist";

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" | "info" {
  const s = status.toLowerCase();
  if (["delivered", "completed", "paid", "confirmed", "resolved"].includes(s)) return "success";
  if (["pending", "awaiting", "processing", "in transit", "transit"].includes(s)) return "warning";
  if (["failed", "declined", "cancelled", "closed"].includes(s)) return "error";
  return "neutral";
}

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<AccountOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    // Loading the account overview from the server on mount and flagging
    // it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getOverview()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load your overview. Try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[920px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-64 h-7" />
          <Skeleton variant="text" className="w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 bg-card border border-divider rounded-lg p-5">
              <Skeleton variant="text" className="w-20" />
              <Skeleton variant="text" className="w-28 h-6" />
              <SkeletonText lines={1} />
              <Skeleton className="h-9 w-32 rounded-md mt-1" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-40" />
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load your overview"
        description={error ?? "Something went wrong."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[920px]">
      <PageHeader
        title={
          data.isNewAccount
            ? `Welcome to Instanta, ${data.greetingName ?? user?.firstName}`
            : `Welcome back, ${data.greetingName ?? user?.firstName}`
        }
        subtitle={
          data.isNewAccount
            ? "Let's get your account set up."
            : "Here's what's happening across your deliveries, trips, and payments."
        }
      />

      {data.isNewAccount && (
        <OnboardingChecklist
          emailVerified={data.emailVerified}
          hasPaymentMethod={data.hasPaymentMethod}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardKicker>Wallet</CardKicker>
          <CardTitle>{centsToUsd(data.walletCents)}</CardTitle>
          <CardBody>Available balance</CardBody>
          <LinkButton href="/account/payments" variant="secondary" size="default" className="self-start">
            Manage wallet
          </LinkButton>
        </Card>

        <Card>
          <CardKicker>Upcoming trip</CardKicker>
          {data.upcomingTrip ? (
            <>
              <CardTitle>
                {data.upcomingTrip.originCode} → {data.upcomingTrip.destinationCode}
              </CardTitle>
              <CardBody>
                {data.upcomingTrip.flightNo} · {data.upcomingTrip.date} at {data.upcomingTrip.depart}
              </CardBody>
            </>
          ) : (
            <CardBody>No upcoming trips booked.</CardBody>
          )}
          <LinkButton href="/account/trips" variant="secondary" size="default" className="self-start">
            View trips
          </LinkButton>
        </Card>

        <Card>
          <CardKicker>Active delivery</CardKicker>
          {data.activeDelivery ? (
            <>
              <CardTitle>{data.activeDelivery.trackingId}</CardTitle>
              <CardBody>
                {data.activeDelivery.from} → {data.activeDelivery.to} · {data.activeDelivery.status}
              </CardBody>
            </>
          ) : (
            <CardBody>No active deliveries.</CardBody>
          )}
          <LinkButton href="/logistics/track" variant="secondary" size="default" className="self-start">
            Track delivery
          </LinkButton>
        </Card>
      </div>

      {data.needsAttention.length > 0 && (
        <div>
          <SectionKicker>Needs attention</SectionKicker>
          <div className="flex flex-col gap-2">
            {data.needsAttention.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg no-underline text-text hover:border-neutral-300"
              >
                <span className="size-8 grid place-items-center bg-[#fff8e1] text-[#996404] rounded-md shrink-0">
                  <Icon name="alert" size={16} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-neutral-600">{item.sub}</span>
                </span>
                <Icon name="right" size={16} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <SectionKicker>Recent activity</SectionKicker>
          <Link href="/account/activity" className="text-sm font-medium text-accent-700 no-underline">
            View all
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {data.recent.length === 0 && (
            <EmptyState
              icon="activity"
              title="No activity yet"
              description="Your deliveries, trips and payments will show up here."
            />
          )}
          {data.recent.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg"
            >
              <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                <Icon name={row.icon as never} size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{row.title}</span>
                <span className="block text-xs text-neutral-600">
                  {row.ref} · {row.date}
                </span>
              </span>
              <span className="text-sm font-medium">{row.amount}</span>
              <Tag variant={statusVariant(row.status)}>{row.status}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
