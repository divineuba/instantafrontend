"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { getAdminContent, createCmsPage, updateCmsPageStatus, type AdminCmsPage } from "@/lib/admin";

const STATUS_CYCLE = { DRAFT: "IN_REVIEW", IN_REVIEW: "PUBLISHED", PUBLISHED: "DRAFT" } as const;

export default function AdminContentPage() {
  const [data, setData] = React.useState<AdminCmsPage[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminContent()
      .then((d) => setData(d))
      .catch(() => setError("Couldn't load content. Try again."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    const name = window.prompt("Name the new page");
    if (!name) return;
    setCreating(true);
    try {
      await createCmsPage({ name, icon: "file" });
      load();
    } finally {
      setCreating(false);
    }
  }

  async function handleAdvanceStatus(page: AdminCmsPage) {
    const current = page.s.toUpperCase().replace(" ", "_") as keyof typeof STATUS_CYCLE;
    const next = STATUS_CYCLE[current] ?? "DRAFT";
    setBusyId(page.id);
    try {
      await updateCmsPageStatus(page.id, next);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1120px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-sm text-neutral-600 mt-1">Pages across the group site and every business.</p>
        </div>
        <Button variant="primary" disabled={creating} onClick={handleCreate}>
          {creating ? "Creating…" : "New page"}
        </Button>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading content…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center gap-2.5">
                <span className="size-9 grid place-items-center bg-accent-100 text-accent-800 rounded-[10px]">
                  <Icon name={p.icon as IconName} size={17} />
                </span>
                <CardTitle className="flex-1">{p.n}</CardTitle>
                <Tag style={{ background: p.sbg, color: p.sfg }}>{p.s}</Tag>
              </div>
              <div className="flex flex-col gap-1.5">
                {p.blocks.slice(0, 3).map((b) => (
                  <div key={b.t} className="flex items-center gap-2 text-xs text-neutral-700">
                    <Icon name={b.icon as IconName} size={13} /> {b.t}
                  </div>
                ))}
                {p.blocks.length === 0 && (
                  <div className="text-xs text-neutral-500">No blocks yet.</div>
                )}
              </div>
              <Button
                variant="secondary"
                className="self-start !px-3 !py-1.5 text-xs"
                disabled={busyId === p.id}
                onClick={() => handleAdvanceStatus(p)}
              >
                Move to {STATUS_CYCLE[p.s.toUpperCase().replace(" ", "_") as keyof typeof STATUS_CYCLE] ?? "Draft"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
