"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAdminCustomers,
  getAdminDeliveries,
  getAdminBookings,
  type AdminCustomer,
  type AdminDeliveryRow,
  type AdminBookingRow,
} from "@/lib/admin";

interface Results {
  customers: AdminCustomer[];
  deliveries: AdminDeliveryRow[];
  bookings: AdminBookingRow[];
}

function matches(term: string, ...fields: string[]) {
  return fields.some((f) => f.toLowerCase().includes(term));
}

function AdminSearchBody() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = React.useState(q);
  const [data, setData] = React.useState<Results | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(q);
  }, [q]);

  React.useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      getAdminCustomers(),
      getAdminDeliveries("del") as Promise<AdminDeliveryRow[]>,
      getAdminBookings("book") as Promise<AdminBookingRow[]>,
    ])
      .then(([customers, deliveries, bookings]) => {
        if (active) setData({ customers, deliveries, bookings });
      })
      .catch(() => {
        if (active) setError("Couldn't load search results.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = searchTerm.trim();
    router.push(term ? `/admin/search?q=${encodeURIComponent(term)}` : "/admin/search");
  }

  const term = q.trim().toLowerCase();
  const customers = data && term ? data.customers.filter((c) => matches(term, c.n, c.e)) : data?.customers ?? [];
  const deliveries = data && term
    ? data.deliveries.filter((d) => matches(term, d.id, d.cust, d.route, d.rider))
    : data?.deliveries ?? [];
  const bookings = data && term
    ? data.bookings.filter((b) => matches(term, b.pnr, b.p, b.r, b.a))
    : data?.bookings ?? [];
  const totalMatches = customers.length + deliveries.length + bookings.length;

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <PageHeader
        title="Search"
        subtitle="Look up customers, deliveries and bookings across Instanta."
      />

      <form onSubmit={submitSearch} className="relative max-w-md">
        <span className="absolute left-2.5 top-2.5 text-neutral-600">
          <Icon name="search" size={16} />
        </span>
        <input
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full min-h-[38px] pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]"
          placeholder="Search customers, bookings, deliveries…"
        />
      </form>

      {error && <EmptyState icon="alert" title="Couldn't load search results" description={error} />}

      {loading && (
        <Table>
          <Tbody>
            <SkeletonTableRows rows={6} columns={5} />
          </Tbody>
        </Table>
      )}

      {!loading && !error && data && !term && (
        <EmptyState icon="search" title="Start typing to search" description="Search by name, email, reference or route." />
      )}

      {!loading && !error && data && term && totalMatches === 0 && (
        <EmptyState icon="search" title="No matches" description={`Nothing matches "${q}".`} />
      )}

      {!loading && !error && data && term && customers.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Customers</div>
          <Table>
            <Thead>
              <Tr>
                <Th>Customer</Th>
                <Th>Type</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customers.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <span className="block font-medium">{c.n}</span>
                    <span className="block text-xs text-neutral-600">{c.e}</span>
                  </Td>
                  <Td>{c.t}</Td>
                  <Td>
                    <Tag style={{ background: c.sbg, color: c.sfg }}>{c.st}</Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      {!loading && !error && data && term && deliveries.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Deliveries</div>
          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Customer</Th>
                <Th>Route</Th>
                <Th>Rider</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deliveries.map((d) => (
                <Tr key={d.id}>
                  <Td className="font-medium">{d.id}</Td>
                  <Td>{d.cust}</Td>
                  <Td>{d.route}</Td>
                  <Td>{d.rider}</Td>
                  <Td>
                    <Tag style={{ background: d.sbg, color: d.sfg }}>{d.status}</Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      {!loading && !error && data && term && bookings.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] tracking-[.12em] uppercase text-neutral-600">Bookings</div>
          <Table>
            <Thead>
              <Tr>
                <Th>PNR</Th>
                <Th>Passenger</Th>
                <Th>Route</Th>
                <Th>Airline</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookings.map((b) => (
                <Tr key={b.pnr}>
                  <Td className="font-medium">{b.pnr}</Td>
                  <Td>{b.p}</Td>
                  <Td>{b.r}</Td>
                  <Td>{b.a}</Td>
                  <Td>
                    <Tag style={{ background: b.sbg, color: b.sfg }}>{b.s}</Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminSearchPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminSearchBody />
    </React.Suspense>
  );
}
