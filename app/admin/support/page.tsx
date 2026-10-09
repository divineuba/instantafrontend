"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { getAdminSupport, updateAdminTicket, type AdminTicketRow } from "@/lib/admin";

const STATUSES = ["OPEN", "AWAITING", "RESOLVED", "CLOSED"] as const;

export default function AdminSupportPage() {
  const [data, setData] = React.useState<AdminTicketRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminSupport()
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load tickets. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(id: string, status: (typeof STATUSES)[number]) {
    setBusyId(id);
    try {
      await updateAdminTicket(id, { status });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-neutral-600 mt-1">Open tickets across every business, newest first.</p>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading tickets…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <Table>
          <Thead>
            <Tr>
              <Th>Ticket</Th>
              <Th>Customer</Th>
              <Th>Business</Th>
              <Th>Priority</Th>
              <Th>Assigned to</Th>
              <Th>SLA</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((t) => (
              <Tr key={t.id}>
                <Td>
                  <span className="block font-medium">{t.t}</span>
                  <span className="block text-xs text-neutral-600">{t.ref}</span>
                </Td>
                <Td>{t.c}</Td>
                <Td>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name={t.icon as IconName} size={13} /> {t.b}
                  </span>
                </Td>
                <Td>
                  <Tag style={{ background: t.pbg, color: t.pfg }}>{t.p}</Tag>
                </Td>
                <Td>{t.a}</Td>
                <Td style={{ color: t.slac }}>{t.sla}</Td>
                <Td>
                  <select
                    value={t.s.toUpperCase()}
                    disabled={busyId === t.id}
                    onChange={(e) => handleStatusChange(t.id, e.target.value as (typeof STATUSES)[number])}
                    className="text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer"
                    style={{ background: t.sbg, color: t.sfg }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </Td>
              </Tr>
            ))}
            {data.length === 0 && (
              <Tr>
                <Td colSpan={7} className="text-center text-neutral-600 py-8">
                  No open tickets. 🎉
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
