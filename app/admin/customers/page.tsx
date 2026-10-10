"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminCustomers, type AdminCustomer } from "@/lib/admin";

export default function AdminCustomersPage() {
  const [data, setData] = React.useState<AdminCustomer[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminCustomers()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load customers. Try again.");
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
      <PageHeader
        title="Customers"
        subtitle="Every individual and business account across Instanta."
      />

      {error && <EmptyState icon="alert" title="Couldn't load customers" description={error} />}

      {(loading || (data && !error)) && (
        <Table>
          <Thead>
            <Tr>
              <Th>Customer</Th>
              <Th>Type</Th>
              <Th>Uses</Th>
              <Th>Customer since</Th>
              <Th>Lifetime value</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading && <SkeletonTableRows rows={6} columns={6} />}
            {data?.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="size-8 grid place-items-center bg-accent-200 text-accent-800 rounded-[10px] font-semibold text-xs shrink-0">
                      {c.ini}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{c.n}</span>
                      <span className="block text-xs text-neutral-600 truncate">{c.e}</span>
                    </span>
                  </div>
                </Td>
                <Td>{c.t}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {c.uses.map((u) => (
                      <span key={u.l} className="inline-flex items-center gap-1 text-xs text-neutral-700">
                        <Icon name={u.icon as IconName} size={13} /> {u.l}
                      </span>
                    ))}
                    {c.uses.length === 0 && <span className="text-xs text-neutral-500">—</span>}
                  </div>
                </Td>
                <Td>{c.s}</Td>
                <Td className="font-medium">{c.v}</Td>
                <Td>
                  <Tag style={{ background: c.sbg, color: c.sfg }}>{c.st}</Tag>
                </Td>
              </Tr>
            ))}
            {!loading && data?.length === 0 && (
              <Tr>
                <Td colSpan={6} className="p-0">
                  <EmptyState icon="users" title="No customers yet" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
