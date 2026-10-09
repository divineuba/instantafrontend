"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { LOGISTICS_FAQS } from "@/lib/logistics";

export function ServiceFaq() {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div>
      {LOGISTICS_FAQS.map((f, i) => (
        <div key={f.q} className="border-t border-divider">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center py-4.5 bg-transparent border-0 text-[17px] font-medium cursor-pointer text-left text-text"
          >
            {f.q}
            <Icon name={open === i ? "x" : "plus"} size={18} />
          </button>
          {open === i && (
            <p className="text-[15px] text-neutral-700 m-0 mb-4.5 max-w-xl">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
