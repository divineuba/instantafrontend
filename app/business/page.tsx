import Image from "next/image";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { ContactSalesForm } from "@/components/business/contact-sales-form";

const SOLUTIONS: { icon: IconName; title: string; body: string }[] = [
  { icon: "truck", title: "Corporate logistics", body: "Dedicated riders, scheduled routes and delivery SLAs." },
  { icon: "plane", title: "Corporate travel", body: "Travel policy, approvals and negotiated fares." },
  { icon: "briefcase", title: "Business accounts", body: "One workspace for every team and cost centre." },
  { icon: "layers", title: "Bulk services", body: "Upload hundreds of deliveries or group bookings at once." },
  { icon: "chat", title: "Dedicated support", body: "A named account manager and priority line." },
];

const STEPS = [
  { n: "01", title: "Create your workspace", body: "Add company details and invite your team." },
  { n: "02", title: "Set roles and limits", body: "Decide who can book, who approves and what they can spend." },
  { n: "03", title: "Book across services", body: "Deliveries and trips land on one dashboard and one invoice." },
];

export default function BusinessPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <div className="flex flex-col gap-5">
            <Tag variant="outline" className="self-start">
              Instanta for Business
            </Tag>
            <h1 className="text-[clamp(36px,4.8vw,64px)] leading-[1.05]">
              Move goods. Move people. One invoice.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg">
              A business account gives your company corporate logistics,
              corporate travel and consolidated billing, with roles and
              approvals for every team.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton href="/account" variant="primary" className="text-base px-6 py-3">
                Open a business account
              </LinkButton>
              <LinkButton href="#contact" variant="secondary" className="text-base px-6 py-3">
                Talk to sales
              </LinkButton>
            </div>
          </div>
          <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
            <Image
              src="/images/hero.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
          </figure>
        </section>

        {/* Solutions */}
        <section className="ins-container pt-24">
          <SectionKicker>Solutions</SectionKicker>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
            {SOLUTIONS.map((o) => (
              <div key={o.title} className="flex flex-col gap-3">
                <Icon name={o.icon} size={28} className="text-accent" />
                <div className="text-xl font-semibold">{o.title}</div>
                <p className="text-sm text-neutral-700 m-0">{o.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live in a day */}
        <section className="ins-container pt-24 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-14">
          <div>
            <SectionKicker>How it works</SectionKicker>
            <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight">
              Live in a day.
            </h2>
          </div>
          <div className="flex flex-col">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)] gap-5 py-5 border-t border-divider"
              >
                <span className="text-[32px] sm:text-[40px] font-semibold text-accent leading-none">
                  {s.n}
                </span>
                <div>
                  <div className="text-xl font-semibold">{s.title}</div>
                  <p className="text-sm text-neutral-700 mt-1 mb-0">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact sales */}
        <section id="contact" className="ins-container pt-24 pb-24">
          <div className="rounded-lg border border-divider bg-card p-8 lg:p-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10">
            <div>
              <h2 className="text-[clamp(26px,2.8vw,36px)] leading-tight mb-2">
                Talk to our business team
              </h2>
              <p className="text-sm text-neutral-700 m-0">
                Tell us what you move and where your people travel. We reply
                within one business day.
              </p>
            </div>
            <ContactSalesForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
