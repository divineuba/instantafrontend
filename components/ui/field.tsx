import * as React from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  labelAction,
  htmlFor,
  optional,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  labelAction?: React.ReactNode;
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
        <div className="flex items-center justify-between gap-2">
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
          {labelAction}
        </div>
      )}
      {children}
      {hint && !error && (
        <span
          id={htmlFor ? fieldHintId(htmlFor) : undefined}
          className="text-xs text-neutral-600"
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          id={htmlFor ? fieldErrorId(htmlFor) : undefined}
          className="text-xs text-error"
        >
          {error}
        </span>
      )}
    </div>
  );
}

/** Ids Field gives its hint and error text when it has `htmlFor`, so the
 * control can point `aria-describedby` at whichever one is showing. */
export function fieldHintId(id: string) {
  return `${id}-hint`;
}

export function fieldErrorId(id: string) {
  return `${id}-error`;
}

/** The `aria-describedby` value for a control inside a Field. */
export function fieldDescribedBy(
  id: string,
  { hint, error }: { hint?: unknown; error?: unknown },
): string | undefined {
  if (error) return fieldErrorId(id);
  if (hint) return fieldHintId(id);
  return undefined;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
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
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[84px] px-3 py-2 text-sm text-text bg-white border rounded-md transition-[border-color,box-shadow] duration-150 outline-none resize-y",
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
Textarea.displayName = "Textarea";
