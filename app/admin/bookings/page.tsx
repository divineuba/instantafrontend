"use client";

import * as React from "react";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import {
  getAdminBookings,
  approveRefund,
  rejectRefund,
  reviewTravelDocument,
  type BookingsTab,
  type AdminBookingRow,
  type AdminRefundRow,
  type AdminRouteRow,
  type AdminDocRow,
  type AdminDocsEmpty,
} from "@/lib/admin";

export default function AdminBookingsPage() {
  const [tab, setTab] = React.useState<BookingsTab>("book");
  const [data, setData] = React.useState<
    AdminBookingRow[] | AdminRefundRow[] | AdminRouteRow[] | AdminDocRow[] | AdminDocsEmpty | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyRef, setBusyRef] = React.useState<string | null>(null);
  const toast = useToast();

  const load = React.useCallback((t: BookingsTab) => {
    setLoading(true);
    setError(null);
    getAdminBookings(t)
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load bookings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    // Loading the active tab's data from the server on mount/tab-change is a
    // genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(tab);
  }, [tab, load]);

  function handleTabChange(t: BookingsTab) {
    setData(null);
    setTab(t);
  }

  async function handleApprove(pnr: string) {
    setBusyRef(pnr);
    try {
      await approveRefund(pnr);
      load(tab);
      toast("Refund approved.", "success");
    } finally {
      setBusyRef(null);
    }
  }

  async function handleReject(pnr: string) {
    setBusyRef(pnr);
    try {
      await rejectRefund(pnr);
      load(tab);
      toast("Refund rejected.", "success");
    } finally {
      setBusyRef(null);
    }
  }

  async function handleReviewDocument(id: string, action: "APPROVE" | "REJECT") {
    setBusyRef(id);
    try {
      await reviewTravelDocument(id, action);
      load(tab);
      toast(action === "APPROVE" ? "Document approved." : "Document rejected.", "success");
    } finally {
      setBusyRef(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Flight bookings"
        subtitle="Travel operations tickets, refunds, routes and documents."
        actions={
          <Segmented
            name="bookings-tab"
            value={tab}
            onChange={handleTabChange}
            options={[
              { value: "book", label: "Bookings" },
              { value: "refunds", label: "Refunds" },
              { value: "routes", label: "Routes & airlines" },
              { value: "docs", label: "Documents" },
            ]}
          />
        }
      />

      {loading && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={6} columns={6} />
          </Tbody>
        </Table>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load bookings" description={error} />}

      {data && !loading && !error && tab === "book" && (
        <Table>
          <Thead>
            <Tr>
              <Th>PNR</Th>
              <Th>Passenger</Th>
              <Th>Route</Th>
              <Th>Airline</Th>
              <Th>Departure</Th>
              <Th>Booked via</Th>
              <Th>Total</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminBookingRow[]).map((b) => (
              <Tr key={b.pnr}>
                <Td className="font-medium">{b.pnr}</Td>
                <Td>{b.p}</Td>
                <Td>{b.r}</Td>
                <Td>{b.a}</Td>
                <Td>{b.d}</Td>
                <Td>{b.ag}</Td>
                <Td>{b.t}</Td>
                <Td>
                  <Tag style={{ background: b.sbg, color: b.sfg }}>{b.s}</Tag>
                </Td>
              </Tr>
            ))}
            {(data as AdminBookingRow[]).length === 0 && (
              <Tr>
                <Td colSpan={8} className="p-0">
                  <EmptyState icon="plane" title="No active bookings" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {data && !loading && !error && tab === "refunds" && (
        <Table>
          <Thead>
            <Tr>
              <Th>Refund ID</Th>
              <Th>PNR</Th>
              <Th>Passenger</Th>
              <Th>Type</Th>
              <Th>Reason</Th>
              <Th>Amount</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminRefundRow[]).map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium">{r.id}</Td>
                <Td>{r.pnr}</Td>
                <Td>{r.p}</Td>
                <Td>{r.t}</Td>
                <Td>{r.r}</Td>
                <Td>{r.a}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyRef === r.pnr}
                      onClick={() => handleApprove(r.pnr)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyRef === r.pnr}
                      onClick={() => handleReject(r.pnr)}
                    >
                      Reject
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
            {(data as AdminRefundRow[]).length === 0 && (
              <Tr>
                <Td colSpan={7} className="p-0">
                  <EmptyState icon="card" title="No refund requests" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {data && !loading && !error && tab === "routes" && (
        <Table>
          <Thead>
            <Tr>
              <Th>Route</Th>
              <Th>Airlines</Th>
              <Th>Bookings · 30d</Th>
              <Th>Avg fare</Th>
              <Th>Margin</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminRouteRow[]).map((r) => (
              <Tr key={r.r}>
                <Td className="font-medium">{r.r}</Td>
                <Td>{r.a}</Td>
                <Td>{r.b}</Td>
                <Td>{r.f}</Td>
                <Td>{r.m}</Td>
                <Td>
                  <Tag style={{ background: r.sbg, color: r.sfg }}>{r.s}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {data && !loading && !error && tab === "docs" && "empty" in data && (
        <EmptyState
          icon="file"
          title={(data as AdminDocsEmpty).message}
          description={(data as AdminDocsEmpty).sub}
        />
      )}

      {data && !loading && !error && tab === "docs" && !("empty" in data) && (
        <Table>
          <Thead>
            <Tr>
              <Th>PNR</Th>
              <Th>Passenger</Th>
              <Th>Document</Th>
              <Th>Uploaded</Th>
              <Th>Preview</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminDocRow[]).map((d) => (
              <Tr key={d.id}>
                <Td className="font-medium">{d.pnr}</Td>
                <Td>{d.p}</Td>
                <Td>{d.label}</Td>
                <Td>{new Date(d.uploadedAt).toLocaleDateString()}</Td>
                <Td>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-accent-700 underline">
                    View
                  </a>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyRef === d.id}
                      onClick={() => handleReviewDocument(d.id, "APPROVE")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyRef === d.id}
                      onClick={() => handleReviewDocument(d.id, "REJECT")}
                    >
                      Reject
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
