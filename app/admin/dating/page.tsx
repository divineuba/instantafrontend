"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton, SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import {
  getAdminDating,
  getAdminDatingPhotoQueue,
  moderateAdminDatingPhoto,
  getAdminDatingReportQueue,
  resolveAdminDatingReport,
  type AdminDating,
  type AdminDatingPhoto,
  type AdminDatingReport,
} from "@/lib/admin";

function PhotoQueue() {
  const toast = useToast();
  const [photos, setPhotos] = React.useState<AdminDatingPhoto[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    getAdminDatingPhotoQueue().then(setPhotos);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handle(id: string, action: "APPROVE" | "REJECT") {
    setBusyId(id);
    try {
      await moderateAdminDatingPhoto(id, action);
      setPhotos((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
      toast(action === "APPROVE" ? "Photo approved." : "Photo rejected.", "success");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <CardKicker>Photo moderation queue</CardKicker>
      {!photos ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="mt-2.5">
          <EmptyState icon="check" title="Nothing pending" description="All submitted photos have been reviewed." />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2.5">
          {photos.map((p) => (
            <Card key={p.id} className="gap-2.5 !p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.displayName} className="w-full h-40 object-cover rounded-md" />
              <div className="text-sm font-medium">{p.displayName}</div>
              <div className="text-xs text-neutral-600">{p.city} · {p.submittedAt}</div>
              <div className="flex gap-2 mt-1">
                <Button
                  variant="secondary"
                  className="!px-3 !py-1.5 text-xs flex-1"
                  disabled={busyId === p.id}
                  onClick={() => handle(p.id, "REJECT")}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  className="!px-3 !py-1.5 text-xs flex-1"
                  disabled={busyId === p.id}
                  onClick={() => handle(p.id, "APPROVE")}
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportQueue() {
  const toast = useToast();
  const [reports, setReports] = React.useState<AdminDatingReport[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    getAdminDatingReportQueue().then(setReports);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handle(id: string, action: "DISMISS" | "WARN" | "SUSPEND") {
    setBusyId(id);
    try {
      await resolveAdminDatingReport(id, action);
      setReports((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      toast(
        action === "DISMISS" ? "Report dismissed." : action === "WARN" ? "User warned." : "Profile suspended.",
        "success",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <CardKicker>Reports</CardKicker>
      <Table className="mt-2.5">
        <Thead>
          <Tr>
            <Th>Reported</Th>
            <Th>Reported by</Th>
            <Th>Reason</Th>
            <Th>Details</Th>
            <Th>Date</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {!reports && <SkeletonTableRows rows={3} columns={6} />}
          {reports?.map((r) => (
            <Tr key={r.id}>
              <Td className="font-medium">{r.reportedName}</Td>
              <Td>{r.reporterName}</Td>
              <Td>
                <Tag>{r.reason}</Tag>
              </Td>
              <Td className="max-w-[220px] truncate text-neutral-600">{r.details ?? "—"}</Td>
              <Td>{r.createdAt}</Td>
              <Td>
                <div className="flex gap-1.5">
                  <Button
                    variant="secondary"
                    className="!px-2.5 !py-1 text-xs"
                    disabled={busyId === r.id}
                    onClick={() => handle(r.id, "DISMISS")}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="secondary"
                    className="!px-2.5 !py-1 text-xs"
                    disabled={busyId === r.id}
                    onClick={() => handle(r.id, "WARN")}
                  >
                    Warn
                  </Button>
                  <Button
                    variant="primary"
                    className="!px-2.5 !py-1 text-xs"
                    disabled={busyId === r.id}
                    onClick={() => handle(r.id, "SUSPEND")}
                  >
                    Suspend
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
          {reports?.length === 0 && (
            <Tr>
              <Td colSpan={6} className="p-0">
                <EmptyState icon="check" title="No open reports" />
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}

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

          <PhotoQueue />
          <ReportQueue />
        </>
      )}
    </div>
  );
}
