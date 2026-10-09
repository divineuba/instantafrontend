"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { getAdminFinance, type AdminFinance } from "@/lib/admin";

export default function AdminFinancePage() {
  const [data, setData] = React.useState<AdminFinance | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminFinance()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load finance. Try again.");
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
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-neutral-600 mt-1">Group revenue, settlements and payment transactions.</p>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading finance…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.finKpis.map((k) => (
              <Card key={k.l}>
                <CardKicker>{k.l}</CardKicker>
                <CardTitle>{k.v}</CardTitle>
                <CardBody className="!text-xs">{k.d}</CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="gap-3">
              <CardKicker>Revenue by business</CardKicker>
              {data.revByBiz.map((r) => (
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
              <CardKicker>Settlements</CardKicker>
              {data.settlements.map((s) => (
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
            <CardKicker>Recent transactions</CardKicker>
            <Table className="mt-2.5">
              <Thead>
                <Tr>
                  <Th>Transaction</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th>Business</Th>
                  <Th>Method</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.finTx.map((tx) => (
                  <Tr key={tx.id}>
                    <Td className="font-medium">{tx.id}</Td>
                    <Td>{tx.d}</Td>
                    <Td>{tx.c}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={tx.icon as IconName} size={13} /> {tx.b}
                      </span>
                    </Td>
                    <Td>{tx.m}</Td>
                    <Td>{tx.a}</Td>
                    <Td>
                      <Tag style={{ background: tx.sbg, color: tx.sfg }}>{tx.s}</Tag>
                    </Td>
                  </Tr>
                ))}
                {data.finTx.length === 0 && (
                  <Tr>
                    <Td colSpan={7} className="text-center text-neutral-600 py-8">
                      No transactions in the last 30 days.
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
