import { Scene } from "@/components/illustrations/scene";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { LinkButton } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionKicker } from "@/components/ui/section-kicker";
import { ContactSalesForm } from "@/components/business/contact-sales-form";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";

// What a business workspace does today (backend workspaces module and the
// account workspace screens). Keep this list to shipped features.
const SOLUTIONS: { icon: IconName; title: string; body: string }[] = [
  { icon: "users", title: "Team roles", body: "Owners, admins and members, each with the right level of access." },
  { icon: "mail", title: "Email invites", body: "Invite colleagues by email and assign them a cost centre." },
  { icon: "wallet", title: "Monthly limits", body: "Set how much each member can spend in a month." },
  { icon: "check", title: "Approvals", body: "Requests go to an admin to approve or decline before they go ahead." },
  { icon: "file", title: "Statements and reports", body: "See team orders, billing statements and spend in one place." },
];

const STEPS = [
  { n: "01", title: "Create your Instanta account", body: "Or log in if you already have one." },
  { n: "02", title: "Add a business workspace", body: "Name your company from your account and you become its owner." },
  { n: "03", title: "Invite your team and set limits", body: "Choose roles, cost centres and monthly limits for each person." },
];

export default function BusinessPage() {
  return (
    <>
      <Header business="group" />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="ins-container pt-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-14 items-center">
          <FadeInWhenVisible className="flex flex-col gap-5" y={16}>
            <Tag variant="outline" className="self-start">
              Instanta for Business
            </Tag>
            <h1 className="text-[clamp(36px,4.8vw,64px)] leading-[1.05]">
              Your whole team on one Instanta workspace.
            </h1>
            <p className="text-lg text-neutral-700 max-w-lg">
              Add a business workspace to your Instanta account to give your
              team access, set spending limits and approve requests, with
              statements for everything the team orders.
            </p>
            <div className="flex gap-3 flex-wrap">
              <LinkButton
                href={`/register?next=${encodeURIComponent("/account")}`}
                variant="primary"
                className="min-h-12 text-base px-6"
              >
                Get started
              </LinkButton>
              <LinkButton href="#contact" variant="secondary" className="min-h-12 text-base px-6">
                Talk to sales
              </LinkButton>
            </div>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1} y={16}>
            <figure className="relative aspect-[4/3] rounded-lg overflow-hidden border border-divider">
              <Scene variant="growth" className="absolute inset-0" />
            </figure>
          </FadeInWhenVisible>
        </section>

        {/* Solutions */}
        <section className="ins-container pt-24">
          <FadeInWhenVisible>
            <SectionKicker>Solutions</SectionKicker>
            <h2 className="text-[clamp(28px,3.2vw,40px)] leading-tight max-w-xl mb-8">
              The controls a growing team needs.
            </h2>
          </FadeInWhenVisible>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SOLUTIONS.map((o, oi) => (
              <FadeInWhenVisible
                key={o.title}
                delay={oi * 0.06}
                className="flex flex-col gap-3 rounded-lg border border-divider bg-card p-5"
              >
                <span className="flex items-center justify-center size-10 rounded-md bg-accent-100 text-accent-800" aria-hidden="true">
                  <Icon name={o.icon} size={20} />
                </span>
                <h3 className="text-base font-semibold m-0">{o.title}</h3>
                <p className="text-sm text-neutral-700 m-0">{o.body}</p>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="ins-container pt-24 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-14">
          <FadeInWhenVisible>
            <SectionKicker>How it works</SectionKicker>
            <h2 className="text-[clamp(28px,3.2vw,44px)] leading-tight">
              Set up from your account.
            </h2>
          </FadeInWhenVisible>
          <div className="flex flex-col">
            {STEPS.map((s, si) => (
              <FadeInWhenVisible
                key={s.n}
                delay={si * 0.08}
                className="grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)] gap-5 py-5 border-t border-divider"
              >
                <span className="text-[32px] sm:text-[40px] font-semibold text-accent leading-none" aria-hidden="true">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold m-0">{s.title}</h3>
                  <p className="text-sm text-neutral-700 mt-1 mb-0">{s.body}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* Contact sales */}
        <section id="contact" className="ins-container pt-24 pb-24">
          <FadeInWhenVisible className="rounded-lg border border-divider bg-card p-8 lg:p-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10">
            <div>
              <h2 className="text-[clamp(26px,2.8vw,36px)] leading-tight mb-2">
                Talk to our business team
              </h2>
              <p className="text-sm text-neutral-700 m-0">
                Tell us what your team needs and we&apos;ll get back to you by
                email.
              </p>
            </div>
            <ContactSalesForm />
          </FadeInWhenVisible>
        </section>
      </main>
      <Footer />
    </>
  );
}
