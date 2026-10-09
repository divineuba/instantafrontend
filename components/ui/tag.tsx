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
        success: "bg-[#e9f6ec] text-[#1e7e34]",
        warning: "bg-[#fff8e1] text-[#996404]",
        error: "bg-[#fbe7e9] text-[#a71d2a]",
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
