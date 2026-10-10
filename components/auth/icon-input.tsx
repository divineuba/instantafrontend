"use client";

import * as React from "react";
import { Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export const IconInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; icon: IconName }
>(({ icon, className, ...props }, ref) => {
  return (
    <div className="relative">
      <span className="absolute left-3 top-0 h-full flex items-center text-neutral-400 pointer-events-none">
        <Icon name={icon} size={16} />
      </span>
      <Input ref={ref} className={cn("pl-9", className)} {...props} />
    </div>
  );
});
IconInput.displayName = "IconInput";
