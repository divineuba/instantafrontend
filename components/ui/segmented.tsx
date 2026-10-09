import * as React from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-0.5 p-[3px] bg-neutral-200 rounded-md",
        className,
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-medium rounded-lg cursor-pointer transition-[background-color,box-shadow,color]",
              checked
                ? "bg-white text-text shadow-sm"
                : "text-neutral-700 hover:text-text",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
