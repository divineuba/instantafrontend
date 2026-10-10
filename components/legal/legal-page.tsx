import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Tag } from "@/components/ui/tag";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";

export interface LegalSection {
  title: string;
  body: string;
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function LegalPage({
  kicker,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Header business="group" />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-28 right-[10%] w-80 h-80 rounded-full bg-accent/10 blur-[100px]"
            aria-hidden="true"
          />
          <div className="ins-container relative pt-16 pb-6">
            <FadeInWhenVisible>
              <Tag variant="outline" className="mb-5">
                {kicker}
              </Tag>
              <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05]">{title}</h1>
              <p className="text-sm text-neutral-600 mt-3">Last updated {lastUpdated}</p>
              <p className="text-base text-neutral-700 max-w-2xl mt-4">{intro}</p>
            </FadeInWhenVisible>
          </div>
        </section>

        <section className="ins-container pb-24 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-12">
          <nav className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-1 border-l border-divider pl-4">
              {sections.map((s) => (
                <a
                  key={s.title}
                  href={`#${slugify(s.title)}`}
                  className="text-sm text-neutral-600 no-underline hover:text-accent-700 transition-colors duration-150 py-1"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="flex flex-col gap-10 max-w-3xl">
            {sections.map((s, i) => (
              <FadeInWhenVisible key={s.title} delay={Math.min(i * 0.04, 0.3)}>
                <div id={slugify(s.title)} className="scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-2">{s.title}</h2>
                  <p className="text-sm text-neutral-700 leading-relaxed m-0">{s.body}</p>
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
