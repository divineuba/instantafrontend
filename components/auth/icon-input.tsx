"use client";

import * as React from "react";
import { Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/** Input with a leading icon, sized for comfortable tapping (44px). */
export const IconInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; icon: IconName }
>(({ icon, className, ...props }, ref) => {
  return (
    <div className="relative">
      <span
        className="absolute left-3 top-0 h-full flex items-center text-neutral-500 pointer-events-none"
        aria-hidden="true"
      >
        <Icon name={icon} size={16} />
      </span>
      <Input ref={ref} className={cn("min-h-11 pl-9 text-[15px]", className)} {...props} />
    </div>
  );
});
IconInput.displayName = "IconInput";
