import * as React from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

export function EmptyState({
  icon = "info",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 text-center px-6 py-10",
        className,
      )}
    >
      <span className="size-12 grid place-items-center bg-accent-100 text-accent-700 rounded-full">
        <Icon name={icon} size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description ? (
          <p className="text-sm text-neutral-600 mt-1 max-w-[320px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
