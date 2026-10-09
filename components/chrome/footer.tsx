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
        { label: "Careers", href: "/" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Support center", href: "/account/support" },
        { label: "My account", href: "/account" },
        { label: "Contact us", href: "/account/support" },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-footer-bg text-white">
      <div className="ins-container pt-16 pb-12">
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 text-white no-underline mb-12"
        >
          <span className="relative w-7 h-7 rounded-[8px] bg-accent block">
            <span className="absolute right-[22%] top-[22%] w-[30%] h-[30%] rounded-full bg-warm" />
          </span>
          <span className="font-semibold text-2xl tracking-[.14em] text-white">
            INSTANTA
          </span>
        </Link>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.3fr] gap-x-6 gap-y-10">
          {columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-3">
              <div className="text-base font-medium text-white">
                {c.title}
              </div>
              {c.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/70 no-underline hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-3.5">
            <p className="text-sm text-white/70 max-w-[320px] m-0">
              One group. Many ways to move forward. Logistics and travel
              today, more businesses tomorrow.
            </p>
            <div className="text-xs text-white/50">
              Lagos · Abuja · Accra · Nairobi
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="ins-container py-5 flex flex-col sm:flex-row gap-2.5 sm:justify-between items-center text-xs text-white/50 text-center sm:text-left">
          <span>© 2026 Instanta Group</span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
            <Link href="/design-system" className="text-inherit no-underline hover:text-white">
              Design system
            </Link>
            <Link href="/admin" className="text-inherit no-underline hover:text-white">
              Operations center
            </Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
