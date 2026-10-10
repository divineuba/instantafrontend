"use client";

import * as React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOverview, type AdminOverview, type BizFilter } from "@/lib/admin";

export default function AdminOverviewPage() {
  const [biz, setBiz] = React.useState<BizFilter>("all");
  const [data, setData] = React.useState<AdminOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminOverview(biz)
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load the overview. Try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [biz]);

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title={data?.ovTitle ?? "Overview"}
        subtitle={
          data ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name={data.bizIcon as IconName} size={14} /> {data.bizName}
            </span>
          ) : (
            "Across every Instanta business"
          )
        }
        actions={
          <Segmented
            name="biz"
            value={biz}
            onChange={setBiz}
            options={[
              { value: "all", label: "All businesses" },
              { value: "logistics", label: "Logistics" },
              { value: "travels", label: "Travels" },
            ]}
          />
        }
      />

      {loading && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load the overview" description={error} />}

      {data && !loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.kpis.map((kpi) => (
              <Card key={kpi.l}>
                <CardKicker>{kpi.l}</CardKicker>
                <CardTitle>{kpi.v}</CardTitle>
                <CardBody style={{ color: kpi.dc }} className="!text-xs font-medium">
                  {kpi.d}
                </CardBody>
              </Card>
            ))}
          </div>

          <Card className="gap-4">
            <div className="flex items-center justify-between">
              <CardKicker>Revenue · last 30 days</CardKicker>
              <div className="flex items-center gap-4">
                {data.legend.map((item) => (
                  <span key={item.n} className="inline-flex items-center gap-1.5 text-xs text-neutral-700">
                    <span className="size-2 rounded-full" style={{ background: item.c }} />
                    {item.n}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-[3px] h-32">
              {data.days.map((d, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end gap-px" title={`${d.l} / ${d.t}`}>
                  <div className="w-full rounded-t-[2px]" style={{ height: d.t, background: "var(--color-accent-300)" }} />
                  <div className="w-full rounded-t-[2px]" style={{ height: d.l, background: "var(--color-accent)" }} />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.panels.map((panel) => (
              <Link key={panel.title} href={panel.href} className="no-underline text-inherit">
                <Card linked className="h-full">
                  <div className="flex items-center gap-2.5">
                    <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md">
                      <Icon name={panel.icon as IconName} size={16} />
                    </span>
                    <CardTitle className="text-[15px]">{panel.title}</CardTitle>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {panel.stats.map((s) => (
                      <div key={s.l}>
                        <div className="text-base font-bold" style={{ color: s.c }}>
                          {s.v}
                        </div>
                        <div className="text-xs text-neutral-600">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {data.actions.length > 0 && (
            <div>
              <CardKicker>Needs attention</CardKicker>
              <div className="flex flex-col gap-2 mt-2.5">
                {data.actions.map((action) => (
                  <Link
                    key={action.t}
                    href={action.href}
                    className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg no-underline text-text hover:border-neutral-300"
                  >
                    <span
                      className="size-8 grid place-items-center rounded-md shrink-0"
                      style={{ background: action.bg, color: action.fg }}
                    >
                      <Icon name={action.icon as IconName} size={16} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{action.t}</span>
                      <span className="block text-xs text-neutral-600">{action.d}</span>
                    </span>
                    <Icon name="right" size={16} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
