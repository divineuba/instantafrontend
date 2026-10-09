import * as React from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full border-separate border-spacing-0 text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function Thead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function Th({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "text-left text-xs font-semibold text-neutral-600 px-3 py-2.5 bg-neutral-100 border-b border-divider first:rounded-tl-[10px] last:rounded-tr-[10px]",
        className,
      )}
      {...props}
    />
  );
}

export function Tbody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-neutral-100", className)} {...props} />
  );
}

export function Td({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-3 border-b border-neutral-200", className)}
      {...props}
    />
  );
}
