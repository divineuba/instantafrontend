"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Card, CardKicker, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { SectionKicker } from "@/components/ui/section-kicker";
import { useWorkspace } from "@/lib/workspace-context";
import { getBizOverview, decideApproval, type BizOverview } from "@/lib/account";

export default function BizOverviewPage() {
  const { activeMembership } = useWorkspace();
  const workspaceId = activeMembership?.workspace.id;
  const [data, setData] = React.useState<BizOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    if (!workspaceId) return;
    setLoading(true);
    getBizOverview(workspaceId)
      .then(setData)
      .catch(() => setError("Couldn't load business overview."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  React.useEffect(() => {
    // Re-querying the server whenever the active workspace changes and
    // flagging it as in-flight is a genuine sync-with-external-system effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleDecide(approvalId: string, approve: boolean) {
    if (!workspaceId) return;
    await decideApproval(workspaceId, approvalId, approve);
    load();
  }

  if (!workspaceId) return <div className="text-sm text-neutral-600">No business workspace selected.</div>;
  if (loading) return <div className="text-sm text-neutral-600">Loading overview…</div>;
  if (error || !data) return <div className="text-sm text-error">{error ?? "Something went wrong."}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">
      <div>
        <h1 className="text-2xl font-bold">{data.workspaceName}</h1>
        <p className="text-sm text-neutral-600 mt-1">Business workspace overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((k, i) => (
          <Card key={i}>
            <CardKicker>{k.l}</CardKicker>
            <CardTitle>{k.v}</CardTitle>
            <CardBody>{k.d}</CardBody>
          </Card>
        ))}
      </div>

      <div>
        <SectionKicker>Pending approvals</SectionKicker>
        {data.approvals.length === 0 ? (
          <div className="text-sm text-neutral-600">No pending approvals.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {data.approvals.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
                <Icon name={a.type === "DELIVERY" ? "package" : "plane"} size={16} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{a.title}</span>
                  <span className="block text-xs text-neutral-600">
                    {a.requestedByName} {a.costCentre ? `· ${a.costCentre}` : ""}
                  </span>
                </span>
                <span className="text-sm font-medium">${(a.amountCents / 100).toFixed(2)}</span>
                {a.status === "PENDING" ? (
                  <div className="flex gap-1.5">
                    <Button variant="secondary" onClick={() => handleDecide(a.id, false)}>
                      Decline
                    </Button>
                    <Button onClick={() => handleDecide(a.id, true)}>Approve</Button>
                  </div>
                ) : (
                  <Tag variant={a.status === "APPROVED" ? "success" : "error"}>{a.status}</Tag>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionKicker>Spend by category</SectionKicker>
        <div className="flex flex-col gap-1">
          {data.spend.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card border border-divider rounded-lg">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: s.c }} />
              <Icon name={s.icon as never} size={16} />
              <span className="flex-1">{s.l}</span>
              <span className="text-xs text-neutral-600">{s.w} of spend</span>
              <span className="text-sm font-medium">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
