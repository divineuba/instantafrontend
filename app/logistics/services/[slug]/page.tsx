import { notFound } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ServiceFaq } from "@/components/logistics/service-faq";
import { LOGISTICS_SERVICES } from "@/lib/logistics";

export function generateStaticParams() {
  return Object.keys(LOGISTICS_SERVICES).map((slug) => ({ slug }));
}

export default async function LogisticsServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svc = LOGISTICS_SERVICES[slug];

  if (!svc) {
    notFound();
  }

  return (
    <>
      <Header business="logistics" active={svc.slug} />
      <main className="flex-1">
        <section className="ins-container pt-14 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <div className="flex flex-col gap-5">
            <span className="flex items-center gap-2 text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
              <Icon name={svc.icon} size={16} />
              Logistics · {svc.name}
            </span>
            <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05]">{svc.title}</h1>
            <p className="text-lg text-neutral-700 max-w-lg">{svc.desc}</p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton href="/logistics/book" variant="primary" className="text-base px-6 py-3">
                {svc.cta}
              </LinkButton>
              <LinkButton href="/business" variant="secondary" className="text-base px-6 py-3">
                Talk to sales
              </LinkButton>
            </div>
          </div>
          <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
            <Image src="/images/hero.jpg" alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" priority />
          </figure>
        </section>

        <section className="ins-container pt-20">
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {svc.benefits.map((b) => (
              <div key={b.t} className="flex flex-col gap-2.5">
                <Icon name="check" size={28} className="text-accent" />
                <div className="text-xl font-semibold">{b.t}</div>
                <p className="text-sm text-neutral-700 m-0">{b.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ins-container pt-20 grid lg:grid-cols-2 gap-14">
          <div>
            <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2.5">
              How it works
            </div>
            {svc.how.map((h) => (
              <div key={h.n} className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 py-4.5 border-t border-divider">
                <span className="text-[32px] font-semibold text-accent leading-none">0{h.n}</span>
                <div className="text-base">{h.t}</div>
              </div>
            ))}
          </div>
          <div className="p-7 rounded-xl border border-divider bg-card self-start flex flex-col gap-3">
            <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold">
              Pricing approach
            </div>
            <div className="text-[48px] sm:text-[56px] font-semibold leading-none">{svc.price}</div>
            <p className="text-[15px] text-neutral-800 m-0">{svc.priceNote}</p>
            <LinkButton href="/logistics/book" variant="secondary" className="self-start">
              Get an exact quote
            </LinkButton>
          </div>
        </section>

        <section className="ins-container pt-20 grid lg:grid-cols-[320px_minmax(0,1fr)] gap-12">
          <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight m-0">Questions</h2>
          <ServiceFaq />
        </section>

        <section className="ins-container pt-20 pb-24">
          <div className="bg-accent-900 text-white p-6 sm:p-10 rounded-2xl flex flex-wrap items-center gap-6">
            <div className="text-2xl sm:text-4xl font-semibold leading-tight mr-auto">{svc.ctaBand}</div>
            <LinkButton href="/logistics/book" variant="inverse" className="h-11">
              {svc.cta}
            </LinkButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
