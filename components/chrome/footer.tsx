import Image from "next/image";
import Link from "next/link";
import { businesses } from "@/lib/businesses.config";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export function Footer() {
  const columns: FooterColumn[] = [
    ...businesses.map((b) => ({ title: b.label.replace("Instanta ", ""), links: b.footerLinks })),
    {
      title: "Group",
      links: [
        { label: "About Instanta", href: "/" },
        { label: "All services", href: "/services" },
        { label: "For Business", href: "/business" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Support center", href: "/support" },
        { label: "My account", href: "/account" },
        { label: "Contact us", href: "/contact" },
        { label: "Delete your account", href: "/delete-account" },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-footer-bg text-white">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-[12%] w-80 h-80 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute -top-24 right-[12%] w-72 h-72 rounded-full bg-warm/10 blur-[100px]" />
      </div>

      <div className="ins-container relative pt-16 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div className="flex flex-col gap-3.5">
            <Link
              href="/"
              className="inline-flex items-center text-white no-underline w-fit"
            >
              <Image
                src="/brand/logo-dark-bg-96h.png"
                alt="Instanta"
                width={160}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-white/60 max-w-[360px] m-0 leading-relaxed">
              One group. Many ways to move forward. Logistics and travel
              today, more businesses tomorrow.
            </p>
          </div>
          <div className="text-xs tracking-[.08em] uppercase text-white/40">
            Lagos · Abuja · Accra · Nairobi
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
          {columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-3.5">
              <div className="text-xs font-semibold tracking-[.1em] uppercase text-white/40">
                {c.title}
              </div>
              {c.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/70 no-underline hover:text-white transition-colors duration-150 w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="ins-container py-5 flex flex-col sm:flex-row gap-2.5 sm:justify-between items-center text-xs text-white/40 text-center sm:text-left">
          <span>© 2026 Instanta Group</span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
            <Link
              href="/privacy"
              className="text-inherit no-underline hover:text-white transition-colors duration-150"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-inherit no-underline hover:text-white transition-colors duration-150"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
