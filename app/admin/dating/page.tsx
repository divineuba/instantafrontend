"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminDating, type AdminDating } from "@/lib/admin";

export default function AdminDatingPage() {
  const [data, setData] = React.useState<AdminDating | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminDating()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load dating. Try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader title="Dating" subtitle="Profiles, matches and messaging activity for Love." />

      {loading && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load dating" description={error} />}

      {data && !loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.datingKpis.map((k) => (
              <Card key={k.l}>
                <CardKicker>{k.l}</CardKicker>
                <CardTitle>{k.v}</CardTitle>
                <CardBody className="!text-xs">{k.d}</CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="gap-3">
              <CardKicker>Active profiles by gender</CardKicker>
              {data.genderBreakdown.length === 0 && (
                <p className="text-sm text-neutral-600 m-0">No active profiles yet.</p>
              )}
              {data.genderBreakdown.map((r) => (
                <div key={r.n} className="flex items-center gap-3">
                  <span className="size-8 grid place-items-center bg-accent-100 text-accent-800 rounded-md shrink-0">
                    <Icon name={r.icon as IconName} size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{r.n}</span>
                      <span className="text-neutral-600">{r.w}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: r.w, background: r.c }} />
                    </div>
                  </div>
                  <span className="font-medium text-sm">{r.v}</span>
                </div>
              ))}
            </Card>

            <Card className="gap-3">
              <CardKicker>Activity, last 30 days</CardKicker>
              {data.activityBreakdown.map((s) => (
                <div key={s.n} className="flex items-center justify-between gap-3 py-1.5 border-b border-divider last:border-0">
                  <div>
                    <div className="text-sm font-medium">{s.n}</div>
                    <div className="text-xs text-neutral-600">{s.d}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.a}</span>
                    <Tag style={{ background: s.sbg, color: s.sfg }}>{s.s}</Tag>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <CardKicker>Recent matches</CardKicker>
            <Table className="mt-2.5">
              <Thead>
                <Tr>
                  <Th>Match</Th>
                  <Th>Date</Th>
                  <Th>People</Th>
                  <Th>Messages</Th>
                  <Th>City</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.datingRows.map((row) => (
                  <Tr key={row.id}>
                    <Td className="font-medium">{row.id}</Td>
                    <Td>{row.d}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={row.icon as IconName} size={13} /> {row.c}
                      </span>
                    </Td>
                    <Td>{row.m}</Td>
                    <Td>{row.a}</Td>
                    <Td>
                      <Tag style={{ background: row.sbg, color: row.sfg }}>{row.s}</Tag>
                    </Td>
                  </Tr>
                ))}
                {data.datingRows.length === 0 && (
                  <Tr>
                    <Td colSpan={6} className="p-0">
                      <EmptyState icon="heart" title="No matches yet" />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
