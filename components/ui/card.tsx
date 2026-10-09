import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  as: Comp = "div",
  linked,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  linked?: boolean;
}) {
  return (
    <Comp
      className={cn(
        "flex flex-col gap-2 bg-card border border-divider rounded-lg p-4 transition-[box-shadow,border-color] duration-150",
        linked &&
          "hover:shadow-md hover:border-neutral-300 cursor-pointer no-underline",
        className,
      )}
      {...props}
    />
  );
}

export function CardKicker({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xs font-semibold text-accent-700", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("font-bold text-[17px] leading-[1.25]", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("m-0 text-sm text-neutral-700 flex-1", className)}
      {...props}
    />
  );
}
