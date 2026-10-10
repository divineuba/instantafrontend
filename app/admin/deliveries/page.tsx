"use client";

import * as React from "react";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import {
  getAdminDeliveries,
  refundDelivery,
  reattemptDelivery,
  type DeliveriesTab,
  type AdminDeliveryRow,
  type AdminRidersResponse,
  type AdminZoneRow,
  type AdminFailedDeliveryRow,
} from "@/lib/admin";

export default function AdminDeliveriesPage() {
  const [tab, setTab] = React.useState<DeliveriesTab>("del");
  const [data, setData] = React.useState<
    AdminDeliveryRow[] | AdminRidersResponse | AdminZoneRow[] | AdminFailedDeliveryRow[] | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback((t: DeliveriesTab) => {
    setLoading(true);
    setError(null);
    getAdminDeliveries(t)
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load deliveries. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load(tab);
  }, [tab, load]);

  function handleTabChange(t: DeliveriesTab) {
    setData(null);
    setTab(t);
  }

  async function handleRefund(id: string) {
    setBusyId(id);
    try {
      await refundDelivery(id);
      load(tab);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReattempt(id: string) {
    setBusyId(id);
    try {
      await reattemptDelivery(id);
      load(tab);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deliveries</h1>
          <p className="text-sm text-neutral-600 mt-1">Logistics operations orders, fleet, zones and disputes.</p>
        </div>
        <Segmented
          name="deliveries-tab"
          value={tab}
          onChange={handleTabChange}
          options={[
            { value: "del", label: "Deliveries" },
            { value: "riders", label: "Riders & fleet" },
            { value: "zones", label: "Zones & pricing" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && tab === "del" && (
        <Table>
          <Thead>
            <Tr>
              <Th>Tracking ID</Th>
              <Th>Customer</Th>
              <Th>Route</Th>
              <Th>Option</Th>
              <Th>Rider</Th>
              <Th>ETA</Th>
              <Th>Fee</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminDeliveryRow[]).map((d) => (
              <Tr key={d.id}>
                <Td className="font-medium">{d.id}</Td>
                <Td>{d.cust}</Td>
                <Td>{d.route}</Td>
                <Td>{d.opt}</Td>
                <Td>{d.rider}</Td>
                <Td>{d.eta}</Td>
                <Td>{d.fee}</Td>
                <Td>
                  <Tag style={{ background: d.sbg, color: d.sfg }}>{d.status}</Tag>
                </Td>
              </Tr>
            ))}
            {(data as AdminDeliveryRow[]).length === 0 && (
              <Tr>
                <Td colSpan={8} className="text-center text-neutral-600 py-8">
                  No active deliveries.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {data && !loading && !error && tab === "riders" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(data as AdminRidersResponse).fleetStats.map((s) => (
              <div key={s.l} className="bg-card border border-divider rounded-lg p-4">
                <div className="text-xs font-semibold text-accent-700">{s.l}</div>
                <div className="font-bold text-[17px]">{s.v}</div>
              </div>
            ))}
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Rider</Th>
                <Th>Vehicle</Th>
                <Th>Zone</Th>
                <Th>Drops today</Th>
                <Th>On-time</Th>
                <Th>Rating</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(data as AdminRidersResponse).riders.map((r) => (
                <Tr key={r.n}>
                  <Td className="font-medium">{r.n}</Td>
                  <Td>{r.v}</Td>
                  <Td>{r.z}</Td>
                  <Td>{r.t}</Td>
                  <Td>{r.o}</Td>
                  <Td>{r.r}</Td>
                  <Td>
                    <Tag style={{ background: r.sbg, color: r.sfg }}>{r.s}</Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {data && !loading && !error && tab === "zones" && (
        <Table>
          <Thead>
            <Tr>
              <Th>Zone</Th>
              <Th>Coverage areas</Th>
              <Th>Standard</Th>
              <Th>Express</Th>
              <Th>Same-day</Th>
              <Th>Per km</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminZoneRow[]).map((z) => (
              <Tr key={z.id}>
                <Td className="font-medium">{z.n}</Td>
                <Td>{z.c}</Td>
                <Td>{z.s}</Td>
                <Td>{z.e}</Td>
                <Td>{z.sd}</Td>
                <Td>{z.k}</Td>
                <Td>
                  <Tag style={{ background: z.sbg, color: z.sfg }}>{z.st}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {data && !loading && !error && tab === "failed" && (
        <Table>
          <Thead>
            <Tr>
              <Th>Tracking ID</Th>
              <Th>Customer</Th>
              <Th>Reason</Th>
              <Th>Attempts</Th>
              <Th>Last update</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(data as AdminFailedDeliveryRow[]).map((d) => (
              <Tr key={d.id}>
                <Td className="font-medium">{d.id}</Td>
                <Td>{d.c}</Td>
                <Td>{d.r}</Td>
                <Td>{d.a}</Td>
                <Td>{d.o}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyId === d.id}
                      onClick={() => handleReattempt(d.id)}
                    >
                      Reattempt
                    </Button>
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={busyId === d.id}
                      onClick={() => handleRefund(d.id)}
                    >
                      Refund
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
            {(data as AdminFailedDeliveryRow[]).length === 0 && (
              <Tr>
                <Td colSpan={6} className="text-center text-neutral-600 py-8">
                  No failed deliveries. 🎉
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
