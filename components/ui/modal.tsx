"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export function Modal({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Flags that we're now running in the browser, where document.body
    // exists as a portal target — a genuine sync with that external fact.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ins-fade-in"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-card border border-divider rounded-lg shadow-lg p-5 ins-slide-up",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  onClose,
  className,
}: {
  title: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 mb-4",
        className,
      )}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 size-7 grid place-items-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-text cursor-pointer"
        >
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function ModalBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-neutral-700", className)} {...props} />;
}

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 mt-5", className)}
      {...props}
    />
  );
}
