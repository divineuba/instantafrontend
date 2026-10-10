import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Scene } from "@/components/illustrations/scene";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";

const VALUES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "zap",
    title: "Move fast",
    body: "We ship in days, not quarters, across logistics and travel at the same time.",
  },
  {
    icon: "users",
    title: "One team",
    body: "Engineering, ops and support sit close to the people actually moving goods and travellers.",
  },
  {
    icon: "globe",
    title: "Built for the region",
    body: "We design for Lagos, Abuja, Accra and Nairobi first, not as an afterthought.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <FadeInWhenVisible>
            <Tag variant="outline" className="mb-5">
              Careers
            </Tag>
            <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05] max-w-xl">
              We&apos;re not hiring right now, but we&apos;re always meeting
              people.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg mt-3">
              We don&apos;t have open roles listed at the moment. If
              you&apos;d like to be considered when something opens up, send
              us a note and your CV and we&apos;ll keep it on file.
            </p>
            <LinkButton
              href="/contact"
              variant="primary"
              className="text-base px-6 py-3 mt-6"
            >
              Get in touch
            </LinkButton>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
              <Scene variant="travel" className="absolute inset-0" />
            </figure>
          </FadeInWhenVisible>
        </section>

        {/* Values */}
        <section className="ins-container pt-24 pb-24">
          <SectionKicker>How we work</SectionKicker>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <FadeInWhenVisible key={v.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3">
                  <span className="flex items-center justify-center size-11 rounded-full bg-accent-100 text-accent-700">
                    <Icon name={v.icon} size={22} />
                  </span>
                  <div className="text-xl font-semibold">{v.title}</div>
                  <p className="text-sm text-neutral-700 m-0">{v.body}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
