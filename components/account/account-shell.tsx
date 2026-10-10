"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";
import { createWorkspace } from "@/lib/account";
import { useToast } from "@/lib/toast-context";
import { VerifyEmailBanner } from "@/components/account/verify-email-banner";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const PERSONAL_NAV: NavItem[] = [
  { href: "/account", label: "Overview", icon: "grid" },
  { href: "/account/activity", label: "Activity", icon: "activity" },
  { href: "/account/trips", label: "Trips", icon: "plane" },
  { href: "/account/payments", label: "Payments", icon: "wallet" },
  { href: "/account/notifications", label: "Notifications", icon: "bell" },
  { href: "/account/support", label: "Support", icon: "chat" },
  { href: "/account/profile", label: "Profile", icon: "user" },
];

const BUSINESS_NAV: NavItem[] = [
  { href: "/account/business", label: "Overview", icon: "grid" },
  { href: "/account/business/team", label: "Team", icon: "users" },
  { href: "/account/business/orders", label: "Orders & trips", icon: "briefcase" },
  { href: "/account/business/billing", label: "Billing & expenses", icon: "card" },
  { href: "/account/business/reports", label: "Reports", icon: "chart" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const {
    memberships,
    activeMembership,
    setActiveWorkspaceId,
    refresh,
  } = useWorkspace();
  const [wsOpen, setWsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newBizOpen, setNewBizOpen] = React.useState(false);
  const [newBizName, setNewBizName] = React.useState("");
  const [newBizError, setNewBizError] = React.useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = React.useState("");
  const toast = useToast();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/account/activity?q=${encodeURIComponent(q)}` : "/account/activity");
  }

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/account")}`);
    }
  }, [loading, user, router, pathname]);

  const isBusiness = activeMembership?.workspace.type === "BUSINESS";
  const nav = isBusiness ? BUSINESS_NAV : PERSONAL_NAV;

  function openCreateBusiness() {
    setNewBizName("");
    setNewBizError(undefined);
    setNewBizOpen(true);
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    const name = newBizName.trim();
    if (!name) {
      setNewBizError("Enter a name for your business workspace");
      return;
    }
    setCreating(true);
    try {
      const workspace = await createWorkspace(name);
      await refresh();
      setActiveWorkspaceId(workspace.id);
      setWsOpen(false);
      setNewBizOpen(false);
      toast("Business workspace created.", "success");
      router.push("/account/business");
    } finally {
      setCreating(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-neutral-600">
        Loading your account…
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-rows-[60px_1fr] md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[60px_1fr] bg-bg">
      <header className="col-span-full flex items-center gap-5 px-6 border-b border-divider">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text no-underline w-auto md:w-[216px]"
        >
          <Image
            src="/brand/mark.svg"
            alt="Instanta"
            width={22}
            height={22}
            className="w-[22px] h-[22px] sm:hidden"
          />
          <Image
            src="/brand/logo-96h.png"
            alt="Instanta"
            width={160}
            height={48}
            className="h-12 w-auto hidden sm:block"
          />
          <span className="text-[17px] tracking-[.14em] text-accent-700 hidden sm:inline">
            ACCOUNT
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative w-full max-w-[420px] hidden sm:block">
          <span className="absolute left-2.5 top-2.5 text-neutral-600">
            <Icon name="search" size={16} />
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[38px] pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-md outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-200)]"
            placeholder="Search deliveries, trips, payments…"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/logistics/book"
            className="hidden sm:inline-flex items-center gap-[7px] text-sm font-semibold text-text px-2 py-[9px] rounded-[0.4rem] hover:bg-accent-100"
          >
            <Icon name="package" size={16} /> Send
          </Link>
          <Link
            href="/travels"
            className="hidden sm:inline-flex items-center gap-[7px] text-sm font-semibold text-text px-2 py-[9px] rounded-[0.4rem] hover:bg-accent-100"
          >
            <Icon name="plane" size={16} /> Fly
          </Link>
          <Link
            href="/account/notifications"
            className="relative flex items-center justify-center size-9 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100"
          >
            <Icon name="bell" size={16} />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="size-9 rounded-[10px] bg-accent-200 text-accent-800 grid place-items-center font-semibold text-xs cursor-pointer border-0"
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-bg border border-divider rounded-xl shadow-lg p-1.5 z-20">
                <div className="px-2.5 py-2 text-sm">
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-neutral-600 text-xs">{user.email}</div>
                </div>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-text no-underline rounded-md hover:bg-accent-100"
                >
                  <Icon name="user" size={15} /> Profile
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
        </div>
      </header>

      <aside className="hidden md:flex flex-col gap-4.5 border-r border-divider p-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setWsOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-divider rounded-xl bg-transparent cursor-pointer text-left"
          >
            <span className="size-[30px] grid place-items-center bg-accent-100 text-accent-800 rounded-[10px]">
              <Icon name={isBusiness ? "building" : "user"} size={16} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate">
                {activeMembership?.workspace.name ?? `${user.firstName} ${user.lastName}`}
              </span>
              <span className="block text-xs text-neutral-600">
                {isBusiness
                  ? `Business · ${activeMembership?.role}`
                  : "Personal account"}
              </span>
            </span>
            <Icon name="down" size={14} />
          </button>
          {wsOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-bg border border-divider shadow-lg z-10 p-1.5 rounded-xl">
              <div className="text-[11px] tracking-[.12em] uppercase text-neutral-600 px-2 py-1.5">
                Switch workspace
              </div>
              {memberships.map((m) => (
                <button
                  key={m.workspace.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(
                      m.workspace.type === "PERSONAL" ? null : m.workspace.id,
                    );
                    setWsOpen(false);
                    router.push(m.workspace.type === "PERSONAL" ? "/account" : "/account/business");
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 text-sm text-text bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent-100 text-left"
                >
                  <Icon name={m.workspace.type === "PERSONAL" ? "user" : "building"} size={16} />
                  {m.workspace.type === "PERSONAL" ? `Personal · ${user.firstName} ${user.lastName}` : `${m.workspace.name} · ${m.role}`}
                </button>
              ))}
              <button
                type="button"
                onClick={openCreateBusiness}
                className="w-full flex items-center gap-2.5 px-2 py-2 text-sm text-accent-700 bg-transparent border-0 border-t border-divider cursor-pointer text-left mt-1 pt-2.5"
              >
                <Icon name="plus" size={16} />
                Create business account
              </button>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-0.5">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-sm no-underline rounded-md border-l-2 ${
                  active
                    ? "text-accent-800 bg-accent-100 border-accent"
                    : "text-text border-transparent hover:bg-neutral-100"
                }`}
              >
                <Icon name={n.icon} size={16} />
                <span className="flex-1">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5 text-xs text-neutral-600 px-2.5">
          <Link href="/" className="flex items-center gap-1.5 no-underline text-inherit">
            <Icon name="back" size={13} /> Back to instanta.com
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer text-inherit"
          >
            <Icon name="logout" size={13} /> Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex flex-col">
        {user.emailVerified === false && <VerifyEmailBanner email={user.email} />}
        <div className="p-6 md:p-10 flex-1">{children}</div>
      </main>

      <Modal open={newBizOpen} onClose={() => setNewBizOpen(false)}>
        <ModalHeader title="Create business account" onClose={() => setNewBizOpen(false)} />
        <form onSubmit={handleCreateBusiness}>
          <ModalBody>
            <Field label="Business name" required error={newBizError}>
              <Input
                autoFocus
                value={newBizName}
                onChange={(e) => {
                  setNewBizName(e.target.value);
                  if (newBizError) setNewBizError(undefined);
                }}
                invalid={!!newBizError}
                placeholder="Acme Logistics Ltd"
              />
            </Field>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setNewBizOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
