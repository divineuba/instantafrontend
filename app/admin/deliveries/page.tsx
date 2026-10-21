"use client";

import * as React from "react";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { OpsMap } from "@/components/admin/ops-map";
import { useToast } from "@/lib/toast-context";
import {
  getAdminDeliveries,
  refundDelivery,
  reattemptDelivery,
  reassignRider,
  getAdminDeliveryMessages,
  type DeliveriesTab,
  type AdminDeliveryRow,
  type AdminRidersResponse,
  type AdminZoneRow,
  type AdminFailedDeliveryRow,
  type AdminRiderRow,
} from "@/lib/admin";
import {
  quoteDelivery,
  SPEEDS,
  WEIGHT_BANDS,
  fmtUsd,
  type DeliverySpeedKey,
  type WeightBandKey,
  type QuoteResponse,
  type DeliveryMessage,
  type DeliveryStatusKey,
} from "@/lib/logistics";
import { connectAdminOpsSocket, type DeliveryUpdateEvent, type ChatNewEvent } from "@/lib/logistics-socket";
import { ApiError } from "@/lib/api";

type ViewTab = DeliveriesTab | "inbox";

export default function AdminDeliveriesPage() {
  const [tab, setTab] = React.useState<ViewTab>("del");
  const [data, setData] = React.useState<
    AdminDeliveryRow[] | AdminRidersResponse | AdminZoneRow[] | AdminFailedDeliveryRow[] | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const toast = useToast();

  // Fed by the one admin ops-room socket connection below; overlays the
  // live ops map's pin status/position on top of the last-loaded snapshot.
  const [liveStatus, setLiveStatus] = React.useState<Record<string, DeliveryStatusKey>>({});
  const socketRef = React.useRef<ReturnType<typeof connectAdminOpsSocket> | null>(null);

  const [reassignTarget, setReassignTarget] = React.useState<AdminDeliveryRow | null>(null);
  const [riders, setRiders] = React.useState<AdminRiderRow[] | null>(null);
  const [ridersLoading, setRidersLoading] = React.useState(false);
  const [selectedRiderId, setSelectedRiderId] = React.useState("");

  const [inboxDeliveries, setInboxDeliveries] = React.useState<AdminDeliveryRow[] | null>(null);
  const [inboxLoading, setInboxLoading] = React.useState(false);
  const [selectedThread, setSelectedThread] = React.useState<AdminDeliveryRow | null>(null);
  const [messages, setMessages] = React.useState<DeliveryMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [reply, setReply] = React.useState("");

  const [testPickup, setTestPickup] = React.useState("12 Admiralty Way, Lekki, Lagos");
  const [testDropoff, setTestDropoff] = React.useState("24 Awolowo Rd, Ikoyi, Lagos");
  const [testSpeed, setTestSpeed] = React.useState<DeliverySpeedKey>("STANDARD");
  const [testWeight, setTestWeight] = React.useState<WeightBandKey>("UP_TO_5KG");
  const [testResult, setTestResult] = React.useState<QuoteResponse | null>(null);
  const [testError, setTestError] = React.useState<string | null>(null);
  const [testLoading, setTestLoading] = React.useState(false);

  const load = React.useCallback((t: DeliveriesTab) => {
    setLoading(true);
    setError(null);
    getAdminDeliveries(t)
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load deliveries. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (tab === "inbox") {
      if (!inboxDeliveries) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInboxLoading(true);
        getAdminDeliveries("del")
          .then((d) => setInboxDeliveries(d as AdminDeliveryRow[]))
          .catch(() => toast("Couldn't load deliveries.", "error"))
          .finally(() => setInboxLoading(false));
      }
      return;
    }
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, load]);

  // One socket for the page's lifetime: feeds the live ops map's pin
  // positions/colors and appends incoming chat messages to an open thread.
  React.useEffect(() => {
    const socket = connectAdminOpsSocket();
    socketRef.current = socket;
    socket.on("delivery:update", (evt: DeliveryUpdateEvent) => {
      setLiveStatus((m) => ({ ...m, [evt.trackingId]: evt.status }));
    });
    socket.on("chat:new", (evt: ChatNewEvent) => {
      setSelectedThread((current) => {
        if (current && current.id === evt.trackingId) {
          setMessages((msgs) => [...msgs, evt.message]);
        }
        return current;
      });
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  function handleTabChange(t: ViewTab) {
    setData(null);
    setTab(t);
  }

  async function handleRefund(id: string) {
    setBusyId(id);
    try {
      await refundDelivery(id);
      load(tab as DeliveriesTab);
      toast("Delivery refunded.", "success");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReattempt(id: string) {
    setBusyId(id);
    try {
      await reattemptDelivery(id);
      load(tab as DeliveriesTab);
      toast("Delivery reattempt scheduled.", "success");
    } finally {
      setBusyId(null);
    }
  }

  function openReassign(d: AdminDeliveryRow) {
    setReassignTarget(d);
    setSelectedRiderId(d.riderId ?? "");
    if (!riders) {
      setRidersLoading(true);
      getAdminDeliveries("riders")
        .then((r) => setRiders((r as AdminRidersResponse).riders))
        .catch(() => toast("Couldn't load riders.", "error"))
        .finally(() => setRidersLoading(false));
    }
  }

  async function submitReassign() {
    if (!reassignTarget || !selectedRiderId) return;
    setBusyId(reassignTarget.id);
    try {
      await reassignRider(reassignTarget.id, selectedRiderId);
      toast("Rider reassigned.", "success");
      setReassignTarget(null);
      if (tab !== "inbox") load(tab);
    } catch {
      toast("Couldn't reassign rider.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function selectThread(d: AdminDeliveryRow) {
    setSelectedThread(d);
    setMessagesLoading(true);
    getAdminDeliveryMessages(d.id)
      .then(setMessages)
      .catch(() => toast("Couldn't load messages.", "error"))
      .finally(() => setMessagesLoading(false));
  }

  function sendReply() {
    if (!selectedThread || !reply.trim() || !socketRef.current) return;
    socketRef.current.emit("chat:send", { trackingId: selectedThread.id, body: reply.trim() });
    setReply("");
  }

  async function runPricingTest() {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    try {
      const q = await quoteDelivery({
        pickupAddress: testPickup,
        destinationAddress: testDropoff,
        speed: testSpeed,
        weightBand: testWeight,
      });
      setTestResult(q);
    } catch (err) {
      setTestError(err instanceof ApiError ? err.message : "Couldn't calculate a quote.");
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Deliveries"
        subtitle="Logistics operations orders, fleet, zones and disputes."
        actions={
          <Segmented
            name="deliveries-tab"
            value={tab}
            onChange={handleTabChange}
            options={[
              { value: "del", label: "Deliveries" },
              { value: "riders", label: "Riders & fleet" },
              { value: "zones", label: "Zones & pricing" },
              { value: "failed", label: "Failed" },
              { value: "inbox", label: "Messages" },
            ]}
          />
        }
      />

      {tab !== "inbox" && loading && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={6} columns={6} />
          </Tbody>
        </Table>
      )}
      {tab !== "inbox" && error && <EmptyState icon="alert" title="Couldn't load deliveries" description={error} />}

      {data && !loading && !error && tab === "del" && (
        <>
          <OpsMap deliveries={data as AdminDeliveryRow[]} liveStatus={liveStatus} onSelect={openReassign} />
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
                <Th />
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
                  <Td className="text-right">
                    <Button
                      variant="secondary"
                      size="default"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => openReassign(d)}
                    >
                      Reassign
                    </Button>
                  </Td>
                </Tr>
              ))}
              {(data as AdminDeliveryRow[]).length === 0 && (
                <Tr>
                  <Td colSpan={9} className="p-0">
                    <EmptyState icon="package" title="No active deliveries" />
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </>
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
                <Tr key={r.id}>
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
        <>
          <div className="bg-card border border-divider rounded-lg p-5 flex flex-col gap-4">
            <div>
              <div className="text-base font-semibold">Test estimate</div>
              <p className="text-sm text-neutral-600 m-0">
                Preview a live quote against the real geocoding + zone pricing seam.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Pickup">
                <Input value={testPickup} onChange={(e) => setTestPickup(e.target.value)} />
              </Field>
              <Field label="Drop-off">
                <Input value={testDropoff} onChange={(e) => setTestDropoff(e.target.value)} />
              </Field>
              <Field label="Speed">
                <Select value={testSpeed} onChange={(e) => setTestSpeed(e.target.value as DeliverySpeedKey)}>
                  {SPEEDS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Weight band">
                <Select value={testWeight} onChange={(e) => setTestWeight(e.target.value as WeightBandKey)}>
                  {WEIGHT_BANDS.map((w) => (
                    <option key={w.key} value={w.key}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="default" className="!px-4 !py-2 text-sm" disabled={testLoading} onClick={runPricingTest}>
                {testLoading ? "Calculating…" : "Calculate"}
              </Button>
              {testResult && (
                <div className="text-sm">
                  <span className="font-bold text-base">{fmtUsd(testResult.total)}</span>{" "}
                  <span className="text-neutral-600">
                    · {testResult.distanceKm.toFixed(1)} km · {testResult.durationMin} min
                  </span>
                </div>
              )}
            </div>
            {testResult && (
              <ul className="text-sm text-neutral-700 m-0 pl-4 list-disc">
                {testResult.breakdown.map((b) => (
                  <li key={b.label}>
                    {b.label}: {fmtUsd(b.amount)}
                  </li>
                ))}
              </ul>
            )}
            {testError && <p className="text-sm text-error m-0">{testError}</p>}
          </div>

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
        </>
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
                <Td colSpan={6} className="p-0">
                  <EmptyState icon="check" title="No failed deliveries" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {tab === "inbox" && (
        <div className="grid sm:grid-cols-[280px_minmax(0,1fr)] gap-4 h-[520px]">
          <div className="border border-divider rounded-lg overflow-y-auto bg-card">
            {inboxLoading && <div className="p-4 text-sm text-neutral-600">Loading…</div>}
            {!inboxLoading && inboxDeliveries?.length === 0 && (
              <div className="p-4 text-sm text-neutral-600">No active deliveries.</div>
            )}
            {inboxDeliveries?.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => selectThread(d)}
                className={`w-full text-left px-4 py-3 border-b border-divider text-sm bg-transparent cursor-pointer hover:bg-accent-100/40 ${
                  selectedThread?.id === d.id ? "bg-accent-100/60" : ""
                }`}
              >
                <div className="font-medium">{d.id}</div>
                <div className="text-neutral-600 text-xs">{d.cust}</div>
              </button>
            ))}
          </div>
          <div className="border border-divider rounded-lg flex flex-col bg-card">
            {!selectedThread && (
              <div className="flex-1 grid place-items-center text-sm text-neutral-600">
                Select a delivery to view its chat.
              </div>
            )}
            {selectedThread && (
              <>
                <div className="px-4 py-3 border-b border-divider text-sm font-medium flex items-center gap-2">
                  <Icon name="chat" size={15} className="text-accent-700" />
                  {selectedThread.id} · {selectedThread.cust}
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {messagesLoading && <div className="text-sm text-neutral-600">Loading…</div>}
                  {!messagesLoading && messages.length === 0 && (
                    <div className="text-sm text-neutral-600">No messages yet.</div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        m.sender === "SUPPORT" ? "self-end bg-accent text-white" : "self-start bg-neutral-100"
                      }`}
                    >
                      {m.body}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-divider flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    placeholder="Reply as support…"
                  />
                  <Button variant="primary" size="default" className="!px-4" onClick={sendReply} disabled={!reply.trim()}>
                    Send
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal open={!!reassignTarget} onClose={() => setReassignTarget(null)}>
        <ModalHeader title="Reassign rider" onClose={() => setReassignTarget(null)} />
        <ModalBody>
          {reassignTarget && (
            <div className="flex flex-col gap-3">
              <p className="m-0">
                {reassignTarget.id} · {reassignTarget.cust}
              </p>
              <Field label="Rider">
                {ridersLoading && !riders ? (
                  <p className="text-sm text-neutral-600 m-0">Loading riders…</p>
                ) : (
                  <Select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)}>
                    <option value="">Select a rider</option>
                    {riders?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.n} · {r.v} · {r.z}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="default" onClick={() => setReassignTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="default"
            disabled={!selectedRiderId || busyId === reassignTarget?.id}
            onClick={submitReassign}
          >
            Reassign
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
