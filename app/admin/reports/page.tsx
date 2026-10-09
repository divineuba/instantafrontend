"use client";

import * as React from "react";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { getAdminReports, type AdminReports } from "@/lib/admin";
import { cn } from "@/lib/cn";

export default function AdminReportsPage() {
  const [rep, setRep] = React.useState(0);
  const [data, setData] = React.useState<AdminReports | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminReports(rep)
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load reports. Try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [rep]);

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-neutral-600 mt-1">Performance trends across the last 9 months.</p>
      </div>

      {data && (
        <div className="flex flex-wrap gap-1 border-b border-divider">
          {data.reportTabs.map((t, i) => (
            <button
              key={t.l}
              type="button"
              onClick={() => setRep(i)}
              className={cn(
                "px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px bg-transparent cursor-pointer",
                t.active ? "text-accent-800 border-accent" : "text-neutral-600 border-transparent hover:text-text",
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="text-sm text-neutral-600">Loading report…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <>
          <h2 className="text-lg font-semibold -mb-2">{data.repTitle}</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.repKpis.map((k) => (
              <Card key={k.l}>
                <CardKicker>{k.l}</CardKicker>
                <CardTitle>{k.v}</CardTitle>
                <CardBody className="!text-xs">{k.d}</CardBody>
              </Card>
            ))}
          </div>

          <Card className="gap-4">
            <CardKicker>Monthly trend</CardKicker>
            <div className="flex items-end gap-3 h-40">
              {data.repBars.map((b) => (
                <div key={b.n} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5">
                  <div className="w-full rounded-t-[3px] bg-accent" style={{ height: b.c }} />
                  <span className="text-[11px] text-neutral-600">{b.n}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-3">
            <CardKicker>Top cities</CardKicker>
            {data.cities.map((c) => (
              <div key={c.n} className="flex items-center justify-between py-1.5 border-b border-divider last:border-0">
                <span className="text-sm font-medium">{c.n}</span>
                <span className="text-sm text-neutral-600">{c.o} orders</span>
              </div>
            ))}
            {data.cities.length === 0 && (
              <div className="text-sm text-neutral-600">No city data yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
