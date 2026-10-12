"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import {
  businesses,
  comingSoonBusinesses,
  getBusiness,
} from "@/lib/businesses.config";
import { useAuth } from "@/lib/auth-context";

export type HeaderBusiness = "group" | "logistics" | "travels" | "crypto" | "love";

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
  const [scrolled, setScrolled] = React.useState(false);
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

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const vertical = business !== "group" ? getBusiness(business) : undefined;

  const isServicesActive = pathname?.startsWith("/services") ?? false;
  const isBusinessActive = pathname?.startsWith("/business") ?? false;
  const isAboutActive = pathname === "/";
  const isSupportActive = pathname?.startsWith("/support") ?? false;

  const navLinkClass = (isActive: boolean) =>
    cn(
      "rounded-full px-3.5 py-2 text-sm font-medium no-underline transition-colors duration-150",
      isActive
        ? "bg-white text-accent-700 shadow-sm"
        : "text-text hover:bg-white/70 hover:text-accent-700",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-divider shadow-[0_1px_0_0_rgba(17,24,39,0.04)]"
          : "bg-bg border-b border-transparent",
      )}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <div className="ins-container relative flex items-center h-[60px]">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text no-underline shrink-0"
        >
          <Image
            src="/brand/logo-96h.png"
            alt="Instanta"
            width={160}
            height={48}
            className="h-12 w-auto"
            priority
          />
          {vertical && (
            <>
              <span className="hdr-opt2 w-px h-5 bg-divider" />
              <span className="hdr-opt2 text-xl tracking-[.14em] text-accent-700 whitespace-nowrap">
                {vertical.name}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full bg-neutral-100/70 p-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150",
              menuOpen
                ? "bg-white text-accent-700 shadow-sm"
                : "text-text hover:bg-white/70 hover:text-accent-700",
            )}
          >
            Businesses
            <Icon
              name="down"
              size={14}
              className={cn(
                "transition-transform duration-200",
                menuOpen && "rotate-180",
              )}
            />
          </button>
          <Link href="/services" className={navLinkClass(isServicesActive)}>
            Services
          </Link>
          <Link href="/business" className={navLinkClass(isBusinessActive)}>
            For Business
          </Link>
          <Link
            href="/"
            className={cn("hdr-opt2", navLinkClass(isAboutActive))}
          >
            About
          </Link>
          <Link
            href="/support"
            className={cn("hdr-opt2", navLinkClass(isSupportActive))}
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
                <Icon
                  name="down"
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    userMenuOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+8px)] w-56 bg-bg border border-divider rounded-xl shadow-lg p-1.5 z-10 origin-top-right"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text no-underline hover:text-accent"
              >
                Log in
              </Link>
              <LinkButton
                href="/register"
                variant="primary"
                className="shadow-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
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
            className="flex items-center justify-center size-9 -mr-1.5 bg-transparent border-0 text-text cursor-pointer rounded-full hover:bg-neutral-100 transition-colors duration-150"
          >
            <Icon name={mobileOpen ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-lg max-h-[calc(100vh-60px)] overflow-y-auto"
          >
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
                href="/support"
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
          </motion.div>
        )}
      </AnimatePresence>

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
                      "relative text-sm no-underline py-[13px] transition-colors duration-150 hover:text-accent",
                      isActive ? "text-accent-700 font-medium" : "text-text",
                    )}
                  >
                    {s.label}
                    {isActive && (
                      <motion.span
                        layoutId="subnav-underline"
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
            <LinkButton
              href={vertical.cta.href}
              variant="primary"
              className="shrink-0 px-3 sm:px-4 transition-transform duration-150 hover:-translate-y-0.5"
            >
              {vertical.cta.label}
            </LinkButton>
          </div>
        </div>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-xl"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
