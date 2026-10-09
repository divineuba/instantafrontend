"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { SectionKicker } from "@/components/ui/section-kicker";
import { useWorkspace } from "@/lib/workspace-context";
import { getBizBilling, type BizBilling } from "@/lib/account";

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  const s = status.toLowerCase();
  if (["paid"].includes(s)) return "success";
  if (["pending", "due"].includes(s)) return "warning";
  if (["overdue", "failed"].includes(s)) return "error";
  return "neutral";
}

export default function BizBillingPage() {
  const { activeMembership } = useWorkspace();
  const workspaceId = activeMembership?.workspace.id;
  const [data, setData] = React.useState<BizBilling | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!workspaceId) return;
    // Re-querying the server whenever the active workspace changes and
    // flagging it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getBizBilling(workspaceId)
      .then(setData)
      .catch(() => setError("Couldn't load billing."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (!workspaceId) return <div className="text-sm text-neutral-600">No business workspace selected.</div>;
  if (loading) return <div className="text-sm text-neutral-600">Loading billing…</div>;
  if (error || !data) return <div className="text-sm text-error">{error ?? "Something went wrong."}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">
      <div>
        <h1 className="text-2xl font-bold">Billing & expenses</h1>
        <p className="text-sm text-neutral-600 mt-1">Current statement, cost centres, and invoices.</p>
      </div>

      <Card className="sm:max-w-[320px]">
        <CardKicker>Current statement</CardKicker>
        <CardTitle>{data.currentStatement}</CardTitle>
        <CardBody>Due this billing cycle</CardBody>
      </Card>

      <div>
        <SectionKicker>Cost centres</SectionKicker>
        <div className="flex flex-col gap-1">
          {data.costCentres.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
              <Icon name="briefcase" size={16} />
              <span className="flex-1">
                <span className="block text-sm font-medium">{c.n}</span>
                <span className="block text-xs text-neutral-600">{c.l}</span>
              </span>
              <span className="text-xs text-neutral-600">{c.t}</span>
              <span className="text-sm font-medium">{c.tot}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionKicker>Invoices</SectionKicker>
        <Table>
          <Thead>
            <Tr>
              <Th>Invoice</Th>
              <Th>Period</Th>
              <Th>Issued</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.invoices.map((inv) => (
              <Tr key={inv.id}>
                <Td>{inv.id}</Td>
                <Td>{inv.period}</Td>
                <Td>{inv.issued}</Td>
                <Td>{inv.amount}</Td>
                <Td>
                  <Tag variant={statusVariant(inv.status)}>{inv.status}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
