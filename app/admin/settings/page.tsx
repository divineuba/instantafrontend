"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { getAdminSettings, type AdminSettingCard } from "@/lib/admin";

export default function AdminSettingsPage() {
  const [data, setData] = React.useState<AdminSettingCard[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError("Couldn't load settings. Try again.");
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-600 mt-1">Group-wide configuration shared by every business.</p>
      </div>

      {loading && <div className="text-sm text-neutral-600">Loading settings…</div>}
      {error && <div className="text-sm text-error">{error}</div>}

      {data && !loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <Card key={s.t} linked>
              <span className="size-9 grid place-items-center bg-accent-100 text-accent-800 rounded-[10px]">
                <Icon name={s.icon as IconName} size={17} />
              </span>
              <CardTitle>{s.t}</CardTitle>
              <CardBody>{s.d}</CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
