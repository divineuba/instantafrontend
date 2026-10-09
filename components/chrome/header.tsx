"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import {
  businesses,
  comingSoonBusinesses,
  getBusiness,
} from "@/lib/businesses.config";

export type HeaderBusiness = "group" | "logistics" | "travels";

export function Header({
  business = "group",
  active = "",
}: {
  business?: HeaderBusiness;
  active?: string;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    // Close the mega menu whenever the route changes. This is a genuine
    // sync-with-external-navigation side effect, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const vertical = business !== "group" ? getBusiness(business) : undefined;

  return (
    <header
      className="relative z-50 bg-bg border-b border-divider"
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div className="ins-container flex items-center gap-5 h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text no-underline"
        >
          <span className="relative w-6 h-6 rounded-[7px] bg-accent block">
            <span className="absolute right-[22%] top-[22%] w-[30%] h-[30%] rounded-full bg-warm" />
          </span>
          <span className="font-semibold text-xl tracking-[.14em]">
            INSTANTA
          </span>
          {vertical && (
            <>
              <span className="hdr-opt2 w-px h-5 bg-divider" />
              <span className="hdr-opt2 text-xl tracking-[.14em] text-accent-700 whitespace-nowrap">
                {vertical.name}
              </span>
            </>
          )}
        </Link>

        <nav className="flex items-center gap-5 mr-auto whitespace-nowrap">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 bg-transparent border-0 p-0 text-sm cursor-pointer",
              menuOpen ? "text-accent" : "text-text",
            )}
          >
            Businesses <Icon name="down" size={14} />
          </button>
          <Link
            href="/services"
            className="text-sm font-medium text-text no-underline hover:text-accent"
          >
            Services
          </Link>
          <Link
            href="/business"
            className="text-sm font-medium text-text no-underline hover:text-accent"
          >
            For Business
          </Link>
          <Link
            href="/"
            className="hdr-opt2 text-sm font-medium text-text no-underline hover:text-accent"
          >
            About
          </Link>
          <Link
            href="/account/support"
            className="hdr-opt2 text-sm font-medium text-text no-underline hover:text-accent"
          >
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <LinkButton
            href="/logistics/track"
            variant="ghost"
            className="hdr-opt text-text px-2.5 py-1.5"
          >
            <Icon name="package" size={16} /> Track delivery
          </LinkButton>
          <LinkButton
            href="/travels"
            variant="ghost"
            className="hdr-opt text-text px-2.5 py-1.5"
          >
            <Icon name="plane" size={16} /> Book a flight
          </LinkButton>
          <LinkButton href="/account" variant="secondary" className="ml-2">
            Log in
          </LinkButton>
          <LinkButton href="/account" variant="primary">
            Get started
          </LinkButton>
        </div>
      </div>

      {vertical && (
        <div className="border-t border-divider">
          <div className="ins-container flex items-center gap-5 h-12 whitespace-nowrap">
            <span className="flex items-center gap-2 text-[15px] tracking-[.08em] uppercase text-accent-700">
              <Icon name={vertical.icon} size={16} /> {vertical.label}
            </span>
            <nav className="flex gap-[18px] mr-auto min-w-0 overflow-x-auto whitespace-nowrap">
              {vertical.subnav.map((s) => {
                const isActive = s.key === active;
                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    className={cn(
                      "text-sm no-underline py-[13px] border-b hover:text-accent",
                      isActive
                        ? "text-accent-700 border-accent"
                        : "text-text border-transparent",
                    )}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </nav>
            <LinkButton href={vertical.cta.href} variant="primary">
              {vertical.cta.label}
            </LinkButton>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 bg-bg border-t border-b border-divider shadow-lg">
          <div
            className="ins-container py-8 pb-9 grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${businesses.length}, minmax(0,1fr)) minmax(0,1fr) 260px`,
            }}
          >
            {businesses.map((b) => (
              <div
                key={b.id}
                className="pr-7 mr-7 border-r border-divider flex flex-col gap-3.5"
              >
                <div className="flex items-center gap-2 text-accent-700">
                  <Icon name={b.icon} size={20} />
                  <span className="text-[11px] tracking-[.14em] uppercase">
                    {b.label}
                  </span>
                </div>
                <div className="font-semibold text-[26px] leading-[1.05]">
                  {b.tagline}
                </div>
                <div className="flex flex-col">
                  {b.megaItems.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="flex justify-between items-center py-2 border-b border-black/[0.08] text-text no-underline text-sm hover:text-accent"
                    >
                      {it.label} <Icon name="right" size={14} />
                    </Link>
                  ))}
                </div>
                <LinkButton
                  href={b.href}
                  variant="ghost"
                  className="self-start pl-0"
                >
                  {b.exploreLabel} <Icon name="arrow" size={14} />
                </LinkButton>
              </div>
            ))}

            <div className="pr-7 mr-7 border-r border-divider flex flex-col gap-3">
              <div className="flex items-center gap-2 text-neutral-600">
                <Icon name="plus" size={20} />
                <span className="text-[11px] tracking-[.14em] uppercase">
                  Coming soon
                </span>
              </div>
              <div className="font-semibold text-[26px] leading-[1.05] text-neutral-700">
                More services on the way.
              </div>
              {comingSoonBusinesses.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 border border-dashed border-divider text-neutral-700 text-sm rounded-xl"
                >
                  <Icon name={f.icon} size={16} /> {f.label}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="text-[11px] tracking-[.14em] uppercase text-neutral-600">
                One account
              </div>
              <p className="text-sm text-neutral-800 m-0">
                Book deliveries and flights, pay and get support from a
                single Instanta account.
              </p>
              <LinkButton
                href="/account"
                variant="secondary"
                className="self-start"
              >
                Open my account
              </LinkButton>
              <LinkButton
                href="/business"
                variant="ghost"
                className="self-start pl-0"
              >
                Instanta for Business <Icon name="arrow" size={14} />
              </LinkButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
