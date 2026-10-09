import * as React from "react";
import { cn } from "@/lib/cn";

export function Radio({
  checked,
  square,
  className,
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  square?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "group inline-flex items-center gap-2 cursor-pointer text-sm select-none",
        className,
      )}
    >
      <input
        type="radio"
        checked={checked}
        className="absolute opacity-0 w-0 h-0 pointer-events-none peer"
        {...props}
      />
      <span
        className={cn(
          "flex-none w-[18px] h-[18px] border-[1.5px] border-neutral-400 bg-white transition-colors",
          square ? "rounded-[5px]" : "rounded-full",
          "peer-checked:border-accent peer-checked:bg-accent peer-checked:shadow-[inset_0_0_0_3px_#fff]",
          "group-hover:border-accent",
        )}
      />
      {children}
    </label>
  );
}
