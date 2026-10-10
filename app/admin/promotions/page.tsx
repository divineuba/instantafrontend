"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/lib/toast-context";
import { getAdminPromotions, createPromotion, updatePromotionStatus, type AdminPromotion } from "@/lib/admin";

const STATUSES = ["DRAFT", "SCHEDULED", "LIVE", "PAUSED", "ENDED"] as const;

export default function AdminPromotionsPage() {
  const [data, setData] = React.useState<AdminPromotion[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const toast = useToast();

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminPromotions()
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load promotions. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    const name = window.prompt("Promotion name");
    if (!name) return;
    const audience = window.prompt("Audience", "All customers") ?? "All customers";
    const business = window.prompt("Business (Group / Logistics / Travels)", "Group") ?? "Group";
    const placement = window.prompt("Placement", "Homepage banner") ?? "Homepage banner";
    const dateRange = window.prompt("Date range", "") ?? "";
    const icon = business === "Logistics" ? "truck" : business === "Travels" ? "plane" : "grid";
    setCreating(true);
    try {
      await createPromotion({ name, audience, business, icon, placement, dateRange });
      load();
      toast("Promotion created.", "success");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(id: string, status: (typeof STATUSES)[number]) {
    setBusyId(id);
    try {
      await updatePromotionStatus(id, status);
      load();
      toast("Status updated.", "success");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Promotions"
        subtitle="Campaigns running across the group and each business."
        actions={
          <Button variant="primary" disabled={creating} onClick={handleCreate}>
            {creating ? "Creating…" : "New promotion"}
          </Button>
        }
      />

      {loading && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={5} columns={6} />
          </Tbody>
        </Table>
      )}
      {error && <EmptyState icon="alert" title="Couldn't load promotions" description={error} />}

      {data && !loading && !error && (
        <Table>
          <Thead>
            <Tr>
              <Th>Promotion</Th>
              <Th>Audience</Th>
              <Th>Business</Th>
              <Th>Placement</Th>
              <Th>Dates</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Icon name={p.icon as IconName} size={14} /> {p.n}
                  </span>
                </Td>
                <Td>{p.a}</Td>
                <Td>{p.b}</Td>
                <Td>{p.pl}</Td>
                <Td>{p.r}</Td>
                <Td>
                  <select
                    value={p.s.toUpperCase()}
                    disabled={busyId === p.id}
                    onChange={(e) => handleStatusChange(p.id, e.target.value as (typeof STATUSES)[number])}
                    className="text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer"
                    style={{ background: p.sbg, color: p.sfg }}
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
                <Td colSpan={6} className="p-0">
                  <EmptyState icon="megaphone" title="No promotions yet" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
