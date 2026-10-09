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
import { useAuth } from "@/lib/auth-context";

export type HeaderBusiness = "group" | "logistics" | "travels";

export function Header({
  business = "group",
  active = "",
}: {
  business?: HeaderBusiness;
  active?: string;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    // Close the mega menu / mobile drawer whenever the route changes. This
    // is a genuine sync-with-external-navigation side effect, not derivable
    // state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const vertical = business !== "group" ? getBusiness(business) : undefined;

  return (
    <header
      className="relative z-50 bg-bg"
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div className="ins-container relative flex items-center h-[60px]">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text no-underline shrink-0"
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

        <nav
          className={cn(
            "hidden md:flex items-center gap-5 whitespace-nowrap absolute left-1/2 top-0 h-full -translate-x-1/2 transition-shadow",
            menuOpen && "shadow-[0_1px_0_0_#F3F4F6]",
          )}
        >
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 bg-transparent border-0 p-0 text-sm cursor-pointer",
              menuOpen ? "text-accent font-semibold" : "text-text",
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

        <div className="hidden md:flex items-center gap-5 ml-auto">
          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-text"
              >
                <span className="size-8 rounded-[10px] bg-accent-200 text-accent-800 grid place-items-center font-semibold text-xs">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
                <span className="text-sm font-medium">{user.firstName}</span>
                <Icon name="down" size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-bg border border-divider rounded-xl shadow-lg p-1.5 z-10">
                  <Link
                    href="/account"
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-text no-underline rounded-md hover:bg-accent-100"
                  >
                    <Icon name="user" size={15} /> My account
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-text bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent-100 text-left"
                  >
                    <Icon name="logout" size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text no-underline hover:text-accent"
              >
                Log in
              </Link>
              <LinkButton href="/register" variant="primary">
                Get started
              </LinkButton>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2 ml-auto">
          {!loading && user ? (
            <LinkButton
              href="/account"
              variant="primary"
              className="px-3 py-1.5 text-[13px]"
            >
              My account
            </LinkButton>
          ) : (
            <LinkButton
              href="/register"
              variant="primary"
              className="px-3 py-1.5 text-[13px]"
            >
              Get started
            </LinkButton>
          )}
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center size-9 -mr-1.5 bg-transparent border-0 text-text cursor-pointer"
          >
            <Icon name={mobileOpen ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-lg max-h-[calc(100vh-60px)] overflow-y-auto">
          <nav className="ins-container py-4 flex flex-col">
            <div className="text-[11px] tracking-[.14em] uppercase text-neutral-600 pt-2 pb-1.5">
              Businesses
            </div>
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={b.href}
                className="flex items-center gap-2.5 py-2.5 border-b border-divider text-text no-underline text-sm"
              >
                <Icon name={b.icon} size={16} className="text-accent-700" />
                {b.label}
              </Link>
            ))}
            <Link
              href="/services"
              className="py-2.5 border-b border-divider text-text no-underline text-sm font-medium mt-2"
            >
              Services
            </Link>
            <Link
              href="/business"
              className="py-2.5 border-b border-divider text-text no-underline text-sm font-medium"
            >
              For Business
            </Link>
            <Link
              href="/logistics/track"
              className="py-2.5 border-b border-divider text-text no-underline text-sm font-medium"
            >
              Track delivery
            </Link>
            <Link
              href="/travels"
              className="py-2.5 border-b border-divider text-text no-underline text-sm font-medium"
            >
              Book a flight
            </Link>
            <Link
              href="/account/support"
              className="py-2.5 text-text no-underline text-sm font-medium"
            >
              Support
            </Link>
            {!loading && user ? (
              <LinkButton
                href="/account"
                variant="secondary"
                className="mt-4 justify-center"
              >
                My account
              </LinkButton>
            ) : (
              <LinkButton
                href="/login"
                variant="secondary"
                className="mt-4 justify-center"
              >
                Log in
              </LinkButton>
            )}
          </nav>
        </div>
      )}

      {vertical && (
        <div className="border-t border-divider">
          <div className="ins-container flex items-center gap-5 h-12 whitespace-nowrap">
            <span className="flex items-center gap-2 text-[15px] tracking-[.08em] uppercase text-accent-700 shrink-0">
              <Icon name={vertical.icon} size={16} />
              <span className="hidden sm:inline">{vertical.label}</span>
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
            <LinkButton href={vertical.cta.href} variant="primary" className="shrink-0 px-3 sm:px-4">
              {vertical.cta.label}
            </LinkButton>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-lg">
          <div
            className="ins-container py-8 pb-9 grid gap-7"
            style={{
              gridTemplateColumns: `repeat(${businesses.length}, minmax(0,1fr)) minmax(0,1fr) 260px`,
            }}
          >
            {businesses.map((b) => (
              <div key={b.id} className="flex flex-col gap-3.5">
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

            <div className="flex flex-col gap-3">
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
