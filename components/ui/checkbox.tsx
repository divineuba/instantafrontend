"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <span className="relative inline-flex shrink-0 size-[18px]">
      <input
        ref={ref}
        type="checkbox"
        className={cn("peer absolute inset-0 size-full opacity-0 cursor-pointer m-0", className)}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none size-[18px] rounded-[5px] border border-neutral-300 bg-white flex items-center justify-center",
          "transition-colors duration-150",
          "peer-hover:border-neutral-400",
          "peer-checked:bg-accent peer-checked:border-accent",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1",
        )}
      >
        <Check
          size={12}
          strokeWidth={3}
          className="text-white opacity-0 scale-75 transition-all duration-150 [.peer:checked~span_&]:opacity-100 [.peer:checked~span_&]:scale-100"
        />
      </span>
    </span>
  );
});
Checkbox.displayName = "Checkbox";
