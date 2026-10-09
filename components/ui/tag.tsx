import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const tagVariants = cva(
  "inline-flex items-center text-xs font-semibold px-2.5 py-[3px] rounded-full whitespace-nowrap",
  {
    variants: {
      variant: {
        accent: "bg-accent-100 text-accent-800",
        info: "bg-accent-100 text-accent-800",
        neutral: "bg-neutral-200 text-neutral-800",
        outline: "border border-accent-300 text-accent-700 bg-white",
        success: "bg-[oklch(0.94_0.04_155)] text-[oklch(0.40_0.09_155)]",
        warning: "bg-[oklch(0.95_0.05_80)] text-[oklch(0.45_0.09_70)]",
        error: "bg-[oklch(0.95_0.03_25)] text-[oklch(0.48_0.13_25)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export function Tag({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagVariants>) {
  return <span className={cn(tagVariants({ variant }), className)} {...props} />;
}
