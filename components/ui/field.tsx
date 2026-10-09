import * as React from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  htmlFor,
  optional,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  optional?: boolean;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-neutral-800"
        >
          {label}
          {required && <span className="text-error"> *</span>}
          {optional && (
            <span className="text-neutral-500 font-normal"> · optional</span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <span className="text-xs text-neutral-600">{hint}</span>
      )}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-[38px] px-3 py-2 text-sm text-text bg-white border rounded-md transition-[border-color,box-shadow] duration-150 outline-none",
        "placeholder:text-neutral-500",
        "hover:border-neutral-400",
        "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]",
        invalid ? "border-error" : "border-neutral-300",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full min-h-[38px] px-3 py-2 text-sm text-text bg-white border border-neutral-300 rounded-md transition-[border-color,box-shadow] duration-150 outline-none",
        "hover:border-neutral-400",
        "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]",
        className,
      )}
      {...props}
    />
  );
});
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[84px] px-3 py-2 text-sm text-text bg-white border border-neutral-300 rounded-md transition-[border-color,box-shadow] duration-150 outline-none resize-y",
        "placeholder:text-neutral-500",
        "hover:border-neutral-400",
        "focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
