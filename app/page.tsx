import { Scene } from "@/components/illustrations/scene";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { ServiceSelector } from "@/components/home/service-selector";
import { SectionKicker } from "@/components/ui/section-kicker";
import { businesses } from "@/lib/businesses.config";

const WHY: { n: string; icon: IconName; title: string; body: string }[] = [
  {
    n: "01",
    icon: "shield",
    title: "One trusted group",
    body: "Every service is run and backed by Instanta Group.",
  },
  {
    n: "02",
    icon: "clock",
    title: "Built for convenience",
    body: "Book, pay and track in a few steps, on any device.",
  },
  {
    n: "03",
    icon: "cpu",
    title: "Technology driven",
    body: "Live tracking, instant pricing and digital tickets.",
  },
  {
    n: "04",
    icon: "chat",
    title: "Customer first",
    body: "Real people on hand around the clock.",
  },
  {
    n: "05",
    icon: "layers",
    title: "Built to scale",
    body: "From one parcel to a company-wide account.",
  },
];

const METRICS = [
  { v: "50K+", l: "Customers served" },
  { v: "100K+", l: "Successful deliveries" },
  { v: "20+", l: "Cities served" },
  { v: "24/7", l: "Customer support" },
];

const BIZ_OFFERS: { icon: IconName; title: string; body: string }[] = [
  { icon: "truck", title: "Corporate logistics", body: "Scheduled and bulk deliveries with SLAs." },
  { icon: "plane", title: "Corporate travel", body: "Staff flights with policies and approvals." },
  { icon: "users", title: "Team accounts", body: "Roles, spend limits and cost centres." },
  { icon: "file", title: "One monthly invoice", body: "Every service on a single statement." },
];

const FUTURE: { icon: IconName; label: string }[] = [
  { icon: "wallet", label: "Payments" },
  { icon: "bed", label: "Hotels" },
  { icon: "car", label: "Car rentals" },
  { icon: "cart", label: "Procurement" },
  { icon: "cpu", label: "Technology services" },
];

export default function Home() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-14 items-end">
          <div className="flex flex-col gap-6 pb-2">
            <div className="flex gap-2 flex-wrap">
              <Tag variant="outline">Instanta Group</Tag>
              <Tag variant="neutral">Logistics</Tag>
              <Tag variant="neutral">Travels</Tag>
              <Tag
                variant="neutral"
                className="border border-dashed border-divider bg-transparent"
              >
                + More soon
              </Tag>
            </div>
            <h1 className="font-script text-[clamp(40px,6vw,80px)] leading-[1.05] text-neutral-900">
              One group.{" "}
              <span className="mark-highlight">Many ways to move forward.</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-xl text-neutral-700">
              We bring together trusted services across logistics, travel and
              more helping individuals and businesses get where they need
              to go.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton href="/services" variant="primary" className="text-base px-6 py-3">
                Explore our services
              </LinkButton>
              <LinkButton href="/account" variant="secondary" className="text-base px-6 py-3">
                Get started
              </LinkButton>
            </div>
          </div>
          <figure className="relative aspect-[5/4] rounded-lg overflow-hidden border border-divider">
            <Scene variant="network" className="absolute inset-0" />
          </figure>
        </section>

        {/* Service selector */}
        <section className="ins-container mt-12">
          <ServiceSelector />
        </section>

        {/* Our businesses */}
        <section id="services" className="ins-container pt-28">
          <div className="flex justify-between items-end mb-8 gap-6 flex-wrap">
            <div>
              <SectionKicker>01 Our businesses</SectionKicker>
              <h2 className="text-[clamp(32px,3.6vw,48px)] leading-tight max-w-xl">
                Two businesses today. Built for many more.
              </h2>
            </div>
            <LinkButton href="/services" variant="ghost">
              See every service <Icon name="arrow" size={14} />
            </LinkButton>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {businesses.map((b) => (
              <article
                key={b.id}
                className="rounded-lg border border-divider bg-card overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/7] border-b border-divider relative">
                  <Scene
                    variant={b.id === "logistics" ? "delivery" : "travel"}
                    className="absolute inset-0"
                  />
                </div>
                <div className="p-7 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
                      <Icon name={b.icon} size={18} /> {b.name}
                    </span>
                  </div>
                  <h3 className="text-[32px] leading-[1.05]">{b.tagline}</h3>
                  <p className="text-[15px] text-neutral-700 max-w-md">
                    {b.id === "logistics"
                      ? "Reliable delivery and logistics services designed for individuals and businesses."
                      : "Flight booking and travel services designed to make every trip easier."}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.megaItems.slice(0, 4).map((m) => (
                      <Tag key={m.label} variant="accent">
                        {m.label}
                      </Tag>
                    ))}
                  </div>
                  <div className="flex gap-2.5 mt-2">
                    <LinkButton href={b.cta.href} variant="primary">
                      {b.cta.label}
                    </LinkButton>
                    <LinkButton href={b.href} variant="secondary">
                      Explore {b.name.toLowerCase()}
                    </LinkButton>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 border border-dashed border-divider rounded-xl px-7 py-5 flex items-center gap-7 flex-wrap">
            <span className="font-semibold text-lg">Next on the platform</span>
            <div className="flex gap-6 flex-wrap mr-auto text-sm text-neutral-700">
              {FUTURE.map((f) => (
                <span key={f.label} className="flex items-center gap-1.5">
                  <Icon name={f.icon} size={16} /> {f.label}
                </span>
              ))}
            </div>
            <Tag variant="neutral">Coming soon</Tag>
          </div>
        </section>

        {/* Why Instanta */}
        <section className="ins-container pt-28">
          <SectionKicker>02 Why Instanta</SectionKicker>
          <h2 className="text-[clamp(32px,3.6vw,48px)] leading-tight max-w-2xl mb-8">
            Every service, one standard.
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
            {WHY.map((w) => (
              <div key={w.n} className="flex flex-col gap-3">
                <Icon name={w.icon} size={28} className="text-accent" />
                <div className="text-xl font-semibold">{w.title}</div>
                <p className="text-sm text-neutral-700 m-0">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section className="ins-container pt-28">
          <div className="rounded-lg border border-divider overflow-hidden grid sm:grid-cols-2 lg:grid-cols-[280px_repeat(4,minmax(0,1fr))]">
            <div className="p-7 border-b sm:border-b-0 sm:border-r border-divider flex flex-col justify-between gap-5">
              <SectionKicker>03 In numbers</SectionKicker>
              <Tag variant="neutral" className="self-start">
                Placeholder figures
              </Tag>
            </div>
            {METRICS.map((m, i) => (
              <div
                key={m.l}
                className={`p-7 flex flex-col gap-1.5 ${
                  i < METRICS.length - 1 ? "border-b sm:border-b-0 lg:border-r border-divider" : ""
                }`}
              >
                <div className="font-semibold text-[clamp(32px,3.6vw,48px)] leading-none text-accent-700 whitespace-nowrap">
                  {m.v}
                </div>
                <div className="text-sm text-neutral-700">{m.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* For Business */}
        <section className="ins-container pt-28 pb-28">
          <div className="rounded-xl bg-accent-900 text-white grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-12 p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-4">
              <div className="text-[11px] tracking-[.14em] uppercase text-accent-300 font-semibold">
                04 Instanta for Business
              </div>
              <h2 className="text-[clamp(28px,3.2vw,42px)] leading-tight">
                Company deliveries and staff travel, on one account.
              </h2>
              <p className="text-accent-200 max-w-md">
                One workspace for your team, consolidated monthly billing and
                reports across every Instanta service.
              </p>
              <div className="flex gap-2.5 flex-wrap mt-2">
                <LinkButton href="/business" variant="inverse">
                  Explore business solutions
                </LinkButton>
                <LinkButton href="/account" variant="inverse-ghost">
                  View workspace demo
                </LinkButton>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {BIZ_OFFERS.map((o) => (
                <div
                  key={o.title}
                  className="p-5 rounded-lg bg-white/10 flex gap-3.5"
                >
                  <Icon name={o.icon} size={20} className="text-accent-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-base">{o.title}</div>
                    <div className="text-[13px] text-accent-200">{o.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
