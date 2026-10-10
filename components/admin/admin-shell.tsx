"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { logout as logoutRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { getAdminMe, type AdminMe } from "@/lib/admin";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = React.useState<AdminMe | null>(null);
  const [error, setError] = React.useState<"forbidden" | "failed" | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/admin/search?q=${encodeURIComponent(q)}` : "/admin/search");
  }

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminMe()
      .then((data) => {
        if (!active) return;
        setMe(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(pathname ?? "/admin")}`);
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setError("forbidden");
          return;
        }
        setError("failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router, pathname]);

  async function handleLogout() {
    await logoutRequest();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-neutral-600">
        Loading Operations Center…
      </div>
    );
  }

  if (error === "forbidden") {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center">
          <div className="size-12 mx-auto mb-4 rounded-full bg-[#fbe7e9] text-[#a71d2a] grid place-items-center">
            <Icon name="lock" size={20} />
          </div>
          <h1 className="text-lg font-semibold text-text mb-1.5">Access denied</h1>
          <p className="text-sm text-neutral-600 mb-5">
            Your account doesn&apos;t have an admin role assigned, so it can&apos;t open the
            Operations Center. Ask a Super Admin to grant you access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 no-underline"
          >
            <Icon name="back" size={14} /> Back to instanta.com
          </Link>
        </div>
      </div>
    );
  }

  if (error === "failed" || !me) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-neutral-600">
        Couldn&apos;t load the Operations Center. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-rows-[60px_1fr] md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[60px_1fr] bg-bg">
      <header className="col-span-full flex items-center gap-5 px-6 border-b border-divider">
        <Link
          href="/admin"
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
            OPS
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
            placeholder="Search customers, bookings, deliveries…"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-accent-800 bg-accent-100 px-2.5 py-1.5 rounded-full">
            <Icon name="shield" size={13} /> {me.roleLabel}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="size-9 rounded-[10px] bg-accent-200 text-accent-800 grid place-items-center font-semibold text-xs cursor-pointer border-0"
            >
              {me.initials}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-bg border border-divider rounded-xl shadow-lg p-1.5 z-20">
                <div className="px-2.5 py-2 text-sm">
                  <div className="font-medium">{me.name}</div>
                  <div className="text-neutral-600 text-xs">{me.email}</div>
                  <div className="text-neutral-600 text-xs mt-1">{me.roleDescription}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-text bg-transparent border-0 cursor-pointer rounded-md hover:bg-accent-100 text-left"
                >
                  <Icon name="logout" size={15} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="hidden md:flex flex-col gap-5 border-r border-divider p-4 overflow-y-auto">
        {me.nav.map((group) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            <div className="px-2.5 pb-1 text-[11px] tracking-[.12em] uppercase text-neutral-500 font-medium">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 text-sm no-underline rounded-md border-l-2 ${
                    active
                      ? "text-accent-800 bg-accent-100 border-accent"
                      : "text-text border-transparent hover:bg-neutral-100"
                  }`}
                >
                  <Icon name={item.icon as IconName} size={16} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-200 rounded-full px-1.5 py-0.5 leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-1.5 text-xs text-neutral-600 px-2.5">
          <Link href="/" className="flex items-center gap-1.5 no-underline text-inherit">
            <Icon name="back" size={13} /> Back to instanta.com
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer text-inherit"
          >
            <Icon name="logout" size={13} /> Log out
          </button>
        </div>
      </aside>

      <main className="p-6 md:p-10 min-w-0">{children}</main>
    </div>
  );
}
