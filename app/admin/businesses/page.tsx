"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { getAdminBusinesses, type AdminBusinessCard } from "@/lib/admin";

export default function AdminBusinessesPage() {
  const [data, setData] = React.useState<AdminBusinessCard[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminBusinesses()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load businesses. Try again.");
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
        <h1 className="text-2xl font-bold">Businesses</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Every business under the Instanta group, live or planned.
        </p>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading businesses…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((b) => (
            <Card
              key={b.n}
              className={b.border === "dashed" ? "border-dashed" : ""}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-9 grid place-items-center rounded-[10px]"
                  style={{ background: b.ibg, color: b.ifg }}
                >
                  <Icon name={b.icon as IconName} size={17} />
                </span>
                <CardTitle className="flex-1">{b.n}</CardTitle>
                <Tag style={{ background: b.sbg, color: b.sfg }}>{b.st}</Tag>
              </div>
              <CardBody>{b.d}</CardBody>
              <div className="flex flex-wrap gap-1.5">
                {b.mods.map((m) => (
                  <span
                    key={m}
                    className="text-xs text-neutral-700 bg-neutral-100 border border-divider rounded-full px-2.5 py-1"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
