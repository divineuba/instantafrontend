import Image from "next/image";
import Link from "next/link";
import { businesses } from "@/lib/businesses.config";
import { Icon } from "@/components/ui/icon";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const MORE: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "All services", href: "/services" },
      { label: "For Business", href: "/business" },
      { label: "Careers", href: "/careers" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Support center", href: "/support" },
      { label: "My account", href: "/account" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Delete your account", href: "/delete-account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-footer-bg text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-[12%] w-80 h-80 rounded-full bg-accent/25 blur-[100px]" />
      </div>

      <div className="ins-container relative pt-14 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="inline-flex items-center text-white no-underline w-fit rounded-md">
              <Image
                src="/brand/logo-dark-bg-96h.png"
                alt="Instanta home"
                width={363}
                height={96}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-white/75 max-w-[380px] m-0 leading-relaxed">
              Deliveries, flights, crypto and dating, with one account. Built
              for Nigeria.
            </p>
          </div>
          <LinkToRegister />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {businesses.map((b) => (
            <div key={b.id} className={`flex flex-col gap-2 space-${b.id}`}>
              <h2 className="flex items-center gap-2 m-0 text-xs font-semibold tracking-[.1em] uppercase text-white/70 font-sans">
                <span className="size-2 rounded-full bg-space" aria-hidden="true" />
                {b.label.replace("Instanta ", "")}
              </h2>
              <FooterLinks links={[{ label: "Overview", href: b.href }, ...b.footerLinks]} />
            </div>
          ))}
          {MORE.map((c) => (
            <div key={c.title} className="flex flex-col gap-2">
              <h2 className="m-0 text-xs font-semibold tracking-[.1em] uppercase text-white/70 font-sans">
                {c.title}
              </h2>
              <FooterLinks links={c.links} />
            </div>
          ))}
        </nav>
      </div>

      <div className="relative border-t border-white/10">
        <div className="ins-container py-5 text-xs text-white/70 text-center sm:text-left">
          © 2026 Instanta Group
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col m-0 p-0 list-none">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            href={l.href}
            className="inline-flex items-center min-h-11 sm:min-h-9 text-sm text-white/80 no-underline hover:text-white hover:underline underline-offset-4 transition-colors duration-150"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LinkToRegister() {
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 self-start lg:self-auto min-h-11 rounded-full bg-white/10 ring-1 ring-white/20 px-5 text-sm font-semibold text-white no-underline hover:bg-white/15"
    >
      Create your Instanta account
      <Icon name="arrow" size={15} aria-hidden="true" />
    </Link>
  );
}
