"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import { businesses, getBusiness } from "@/lib/businesses.config";
import { useAuth } from "@/lib/auth-context";
import { withNext } from "@/lib/safe-redirect";

export type HeaderBusiness = "group" | "logistics" | "travels" | "crypto" | "love";

/** One-line, factual summary of each service for the menu. */
const SERVICE_SUMMARY: Record<string, string> = {
  logistics: "Book a rider, see the price first and track the delivery live.",
  travels: "Search flights, book seats and keep your trips in one place.",
  crypto: "Buy, sell and swap major coins, and cash out in Naira.",
  love: "Discover people and start chatting once you both match.",
};

/** Close a popover on Escape or on a pointer press outside `ref`. */
function useDismiss(
  open: boolean,
  close: () => void,
  ref: React.RefObject<HTMLElement | null>,
  returnFocus?: React.RefObject<HTMLElement | null>,
) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        returnFocus?.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close, ref, returnFocus]);
}

function focusMain(e: React.MouseEvent<HTMLAnchorElement>) {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;
  e.preventDefault();
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus();
  main.scrollIntoView();
}

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
  const pathname = usePathname() ?? "/";
  const { user, loading, logout } = useAuth();
  const reduceMotion = useReducedMotion();

  const headerRef = React.useRef<HTMLElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileButtonRef = React.useRef<HTMLButtonElement>(null);
  const userButtonRef = React.useRef<HTMLButtonElement>(null);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);
  const closeUser = React.useCallback(() => setUserMenuOpen(false), []);
  useDismiss(menuOpen, closeMenu, headerRef, menuButtonRef);
  useDismiss(mobileOpen, closeMobile, headerRef, mobileButtonRef);
  useDismiss(userMenuOpen, closeUser, userMenuRef, userButtonRef);

  React.useEffect(() => {
    // Close the menus whenever the route changes. This is a genuine
    // sync-with-external-navigation side effect, not derivable state.
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
  // Come back to this page after logging in (the home page needs no hint).
  const loginHref = pathname === "/" ? "/login" : withNext("/login", pathname);

  const isServicesActive = pathname.startsWith("/services");
  const isBusinessActive = pathname.startsWith("/business");
  const isSupportActive = pathname.startsWith("/support");

  const navLinkClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center min-h-10 rounded-full px-3.5 text-sm font-medium no-underline transition-colors duration-150",
      isActive
        ? "bg-white text-accent-700 shadow-sm"
        : "text-text hover:bg-white/70 hover:text-accent-700",
    );

  const pop = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-divider shadow-[0_1px_0_0_rgba(17,24,39,0.04)]"
          : "bg-bg border-b border-transparent",
      )}
    >
      <a
        href="#main"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="ins-container relative flex items-center h-[60px]">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text no-underline shrink-0 rounded-md"
        >
          <Image
            src="/brand/logo-96h.png"
            alt="Instanta home"
            width={363}
            height={96}
            className="h-10 sm:h-11 w-auto"
            priority
          />
          {vertical && (
            <>
              <span className="hdr-opt2 w-px h-5 bg-divider" aria-hidden="true" />
              <span
                className={cn(
                  "hdr-opt2 text-xl tracking-[.14em] text-space-ink whitespace-nowrap",
                  `space-${vertical.id}`,
                )}
              >
                {vertical.name}
              </span>
            </>
          )}
        </Link>

        <nav
          aria-label="Main"
          className="hidden md:flex items-center gap-1 rounded-full bg-neutral-100/70 p-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="services-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 min-h-10 rounded-full px-3.5 text-sm font-medium border-0 cursor-pointer transition-colors duration-150",
              menuOpen || isServicesActive
                ? "bg-white text-accent-700 shadow-sm"
                : "bg-transparent text-text hover:bg-white/70 hover:text-accent-700",
            )}
          >
            Services
            <Icon
              name="down"
              size={14}
              aria-hidden="true"
              className={cn("transition-transform duration-200", menuOpen && "rotate-180")}
            />
          </button>
          <Link href="/business" className={navLinkClass(isBusinessActive)}>
            For Business
          </Link>
          <Link href="/support" className={navLinkClass(isSupportActive)}>
            Support
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4 ml-auto">
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                ref={userButtonRef}
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-controls="user-menu"
                className="flex items-center gap-2 min-h-11 bg-transparent border-0 px-1 cursor-pointer text-text rounded-md"
              >
                <span
                  className="size-8 rounded-[10px] bg-accent-200 text-accent-800 grid place-items-center font-semibold text-xs"
                  aria-hidden="true"
                >
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
                <span className="text-sm font-medium">
                  <span className="sr-only">Account menu for </span>
                  {user.firstName}
                </span>
                <Icon
                  name="down"
                  size={14}
                  aria-hidden="true"
                  className={cn("transition-transform duration-200", userMenuOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    id="user-menu"
                    {...pop}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+8px)] w-56 bg-bg border border-divider rounded-xl shadow-lg p-1.5 z-10 origin-top-right"
                  >
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-2.5 min-h-11 text-sm text-text no-underline rounded-md hover:bg-accent-100"
                    >
                      <Icon name="user" size={15} aria-hidden="true" /> My account
                    </Link>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-2.5 min-h-11 text-sm text-text bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent-100 text-left"
                    >
                      <Icon name="logout" size={15} aria-hidden="true" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href={loginHref}
                className="inline-flex items-center min-h-11 px-1 text-sm font-medium text-text no-underline hover:text-accent-700"
              >
                Log in
              </Link>
              <LinkButton
                href="/register"
                variant="primary"
                className="min-h-10 shadow-sm transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
              >
                Create account
              </LinkButton>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1 ml-auto">
          {!loading && user ? (
            <LinkButton href="/account" variant="primary" className="min-h-11 px-3.5 text-[13px]">
              My account
            </LinkButton>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center min-h-11 px-3 text-sm font-semibold text-accent-700 no-underline"
            >
              Log in
            </Link>
          )}
          <button
            ref={mobileButtonRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center size-11 -mr-2 bg-transparent border-0 text-text cursor-pointer rounded-full hover:bg-neutral-100 transition-colors duration-150"
          >
            <Icon name={mobileOpen ? "x" : "menu"} size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            {...pop}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-lg max-h-[calc(100dvh-60px)] overflow-y-auto"
          >
            <nav aria-label="Main" className="ins-container py-4 flex flex-col">
              <p className="text-[11px] tracking-[.14em] uppercase text-neutral-600 m-0 pt-1 pb-2">
                Services
              </p>
              <ul className="grid grid-cols-2 gap-2 m-0 p-0 list-none">
                {businesses.map((b) => (
                  <li key={b.id} className={`space-${b.id}`}>
                    <Link
                      href={b.href}
                      className="flex items-center gap-2.5 min-h-12 px-3 rounded-xl bg-space-soft text-space-ink no-underline text-sm font-semibold"
                    >
                      <Icon name={b.icon} size={17} aria-hidden="true" />
                      {b.label.replace("Instanta ", "")}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col m-0 mt-3 p-0 list-none">
                {[
                  { href: "/services", label: "All services" },
                  { href: "/business", label: "For Business" },
                  { href: "/logistics/track", label: "Track a delivery" },
                  { href: "/support", label: "Support" },
                ].map((l) => (
                  <li key={l.href} className="border-b border-divider last:border-b-0">
                    <Link
                      href={l.href}
                      className="flex items-center justify-between min-h-12 text-text no-underline text-[15px] font-medium"
                    >
                      {l.label}
                      <Icon name="right" size={16} className="text-neutral-500" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              {!loading && user ? (
                <LinkButton href="/account" variant="secondary" className="mt-4 min-h-12 justify-center">
                  My account
                </LinkButton>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <LinkButton href={loginHref} variant="secondary" className="min-h-12 justify-center">
                    Log in
                  </LinkButton>
                  <LinkButton href="/register" variant="primary" className="min-h-12 justify-center">
                    Create account
                  </LinkButton>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {vertical && (
        <div className={cn("border-t border-divider", `space-${vertical.id}`)}>
          <div className="ins-container flex items-center gap-5 h-12 whitespace-nowrap">
            <span className="flex items-center gap-2 text-[15px] tracking-[.08em] uppercase text-space-ink shrink-0">
              <span
                className="grid place-items-center size-7 rounded-lg bg-space-soft"
                aria-hidden="true"
              >
                <Icon name={vertical.icon} size={15} />
              </span>
              <span className="hidden sm:inline">{vertical.label}</span>
            </span>
            <nav
              aria-label={vertical.label}
              className="flex gap-[18px] mr-auto min-w-0 overflow-x-auto whitespace-nowrap"
            >
              {vertical.subnav.map((s) => {
                const isActive = s.key === active;
                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative text-sm no-underline py-[13px] transition-colors duration-150 hover:text-space-ink",
                      isActive ? "text-space-ink font-medium" : "text-text",
                    )}
                  >
                    {s.label}
                    {isActive && (
                      <motion.span
                        layoutId={reduceMotion ? undefined : "subnav-underline"}
                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-space rounded-full"
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
              className="shrink-0 px-3 sm:px-4 bg-space hover:bg-space-ink transition-[transform,background-color] duration-150 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              {vertical.cta.label}
            </LinkButton>
          </div>
        </div>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="services-menu"
            {...pop}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="hidden md:block absolute left-0 right-0 top-[60px] bg-bg border-t border-divider shadow-xl"
          >
            <div className="ins-container py-8">
              <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 m-0 p-0 list-none">
                {businesses.map((b) => (
                  <li
                    key={b.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border border-divider p-5 border-t-4 border-t-space",
                      `space-${b.id}`,
                    )}
                  >
                    <Link
                      href={b.href}
                      className="group flex flex-col gap-2 no-underline text-text rounded-md"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="grid place-items-center size-9 rounded-xl bg-space-soft text-space-ink"
                          aria-hidden="true"
                        >
                          <Icon name={b.icon} size={18} />
                        </span>
                        <span className="font-semibold text-[17px] group-hover:text-space-ink">
                          {b.label.replace("Instanta ", "")}
                        </span>
                      </span>
                      <span className="text-[13px] leading-snug text-neutral-700">
                        {SERVICE_SUMMARY[b.id]}
                      </span>
                    </Link>
                    <ul className="flex flex-col m-0 p-0 list-none">
                      {b.megaItems.map((it) => (
                        <li key={it.label}>
                          <Link
                            href={it.href}
                            className="flex justify-between items-center min-h-10 border-b border-black/[0.06] text-text no-underline text-sm hover:text-space-ink"
                          >
                            {it.label}
                            <Icon name="right" size={14} aria-hidden="true" className="text-neutral-500" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100/70 px-5 py-3">
                <p className="m-0 text-sm text-neutral-800">
                  One Instanta account signs you in to all four.
                </p>
                <div className="flex items-center gap-5">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 min-h-10 text-sm font-semibold text-accent-700 no-underline hover:text-accent-800"
                  >
                    All services <Icon name="arrow" size={14} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/business"
                    className="inline-flex items-center gap-1.5 min-h-10 text-sm font-semibold text-accent-700 no-underline hover:text-accent-800"
                  >
                    For Business <Icon name="arrow" size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
