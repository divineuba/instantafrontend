"use client";

import * as React from "react";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { SectionKicker } from "@/components/ui/section-kicker";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useWorkspace } from "@/lib/workspace-context";
import { getBizReports, centsToUsd, type BizReports } from "@/lib/account";

export default function BizReportsPage() {
  const { activeMembership } = useWorkspace();
  const workspaceId = activeMembership?.workspace.id;
  const [data, setData] = React.useState<BizReports | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!workspaceId) return;
    // Re-querying the server whenever the active workspace changes and
    // flagging it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getBizReports(workspaceId)
      .then(setData)
      .catch(() => setError("Couldn't load reports."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (!workspaceId) {
    return <EmptyState icon="building" title="No business workspace selected" />;
  }
  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-[960px]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="w-28 h-7" />
          <Skeleton variant="text" className="w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    );
  }
  if (error || !data) {
    return <EmptyState icon="alert" title="Couldn't load reports" description={error ?? "Something went wrong."} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">
      <PageHeader title="Reports" subtitle="Spend trends across your workspace." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.reportCards.map((r, i) => (
          <Card key={i}>
            <CardKicker>{r.l}</CardKicker>
            <CardTitle>{r.v}</CardTitle>
            <CardBody>{r.d}</CardBody>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <SectionKicker>Monthly spend</SectionKicker>
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent-800 inline-block" /> Logistics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent-400 inline-block" /> Travel
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-56 bg-card border border-divider rounded-lg p-4">
          {data.months.map((m, i) => {
            const logisticsH = Math.max(0, parseInt(m.l, 10) || 0);
            const travelH = Math.max(0, parseInt(m.t, 10) || 0);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-neutral-500">{centsToUsd(m.totalCents)}</span>
                <div className="w-full flex flex-col items-center justify-end" style={{ height: 120 }}>
                  <div className="w-full flex flex-col rounded-t-md overflow-hidden">
                    <div
                      className="w-full bg-accent-800 min-h-[2px]"
                      style={{ height: `${(logisticsH / 100) * 120}px` }}
                    />
                    <div
                      className="w-full bg-accent-400 min-h-[2px]"
                      style={{ height: `${(travelH / 100) * 120}px` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-neutral-600">{m.n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
