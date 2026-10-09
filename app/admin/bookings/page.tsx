"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import {
  getAdminBookings,
  approveRefund,
  rejectRefund,
  type BookingsTab,
  type AdminBookingRow,
  type AdminRefundRow,
  type AdminRouteRow,
  type AdminDocsEmpty,
} from "@/lib/admin";

export default function AdminBookingsPage() {
  const [tab, setTab] = React.useState<BookingsTab>("book");
  const [data, setData] = React.useState<
    AdminBookingRow[] | AdminRefundRow[] | AdminRouteRow[] | AdminDocsEmpty | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyRef, setBusyRef] = React.useState<string | null>(null);

  const load = React.useCallback((t: BookingsTab) => {
    setLoading(true);
    setError(null);
    getAdminBookings(t)
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load bookings. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
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
    } finally {
      setBusyRef(null);
    }
  }

  async function handleReject(pnr: string) {
    setBusyRef(pnr);
    try {
      await rejectRefund(pnr);
      load(tab);
    } finally {
      setBusyRef(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flight bookings</h1>
          <p className="text-sm text-neutral-600 mt-1">Travel operations — tickets, refunds, routes and documents.</p>
        </div>
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
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

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
                <Td colSpan={8} className="text-center text-neutral-600 py-8">
                  No active bookings.
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
                <Td colSpan={7} className="text-center text-neutral-600 py-8">
                  No refund requests.
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
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <span className="size-12 grid place-items-center bg-accent-100 text-accent-800 rounded-full">
            <Icon name="file" size={20} />
          </span>
          <div className="font-semibold">{(data as AdminDocsEmpty).message}</div>
          <div className="text-sm text-neutral-600 max-w-sm">{(data as AdminDocsEmpty).sub}</div>
        </div>
      )}
    </div>
  );
}
