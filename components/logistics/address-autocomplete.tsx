"use client";

import * as React from "react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { suggestAddresses, type AddressSuggestion } from "@/lib/logistics";

/** A plain text address field that also shows a Mapbox-backed suggestion
 * dropdown once the visitor has typed a few characters. Picking a suggestion
 * just fills the field with its full address string — the backend geocodes
 * whatever ends up submitted, so there's no hidden coordinate payload here. */
export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      suggestAddresses(value, controller.signal)
        .then((results) => setSuggestions(results))
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        invalid={invalid}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-divider rounded-md shadow-md max-h-60 overflow-auto py-1">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.fullAddress);
                  setSuggestions([]);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent-100/40 bg-transparent border-0 cursor-pointer"
              >
                <Icon name="pin" size={14} className="text-neutral-500 shrink-0" />
                <span className="truncate">{s.fullAddress}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
