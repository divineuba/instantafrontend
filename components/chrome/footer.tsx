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
    <footer className="border-t border-divider mt-24">
      <div className="ins-container py-14 pb-8 grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative w-6 h-6 rounded-[7px] bg-accent block">
              <span className="absolute right-[22%] top-[22%] w-[30%] h-[30%] rounded-full bg-warm" />
            </span>
            <span className="font-semibold text-xl tracking-[.14em]">
              INSTANTA
            </span>
          </div>
          <p className="text-sm text-neutral-700 max-w-[280px] m-0">
            One group. Many ways to move forward. Logistics and travel
            today, more businesses tomorrow.
          </p>
          <div className="text-xs text-neutral-600">
            Lagos · Abuja · Accra · Nairobi
          </div>
        </div>

        {columns.map((c) => (
          <div key={c.title} className="flex flex-col gap-2">
            <div className="text-[11px] tracking-[.14em] uppercase text-neutral-600 mb-1">
              {c.title}
            </div>
            {c.links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-text no-underline hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="ins-container py-[18px] border-t border-divider flex justify-between text-xs text-neutral-600">
        <span>© 2026 Instanta Group</span>
        <div className="flex gap-5">
          <Link href="/design-system" className="text-inherit no-underline hover:text-accent">
            Design system
          </Link>
          <Link href="/admin" className="text-inherit no-underline hover:text-accent">
            Operations center
          </Link>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
}
