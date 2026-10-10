import Image from "next/image";
import Link from "next/link";
import { Scene } from "@/components/illustrations/scene";
import { Icon, type IconName } from "@/components/ui/icon";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";
import { CurrentYear } from "@/components/auth/current-year";

const BULLETS: { icon: IconName; label: string }[] = [
  { icon: "truck", label: "Same-day delivery, tracked door to door" },
  { icon: "plane", label: "Flight search and booking, no extra app" },
  { icon: "shield", label: "One login across every Instanta business" },
];

export function AuthShell({
  heading,
  blurb,
  children,
}: {
  heading: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <div
        className="lg:hidden relative overflow-hidden px-5 py-6"
        style={{
          background: "linear-gradient(150deg, #241a21 0%, #4a2f3f 48%, #714b67 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.14) 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex items-center justify-center size-8 rounded-full bg-white/10 ring-1 ring-white/15 shrink-0">
            <Icon name="shield" size={14} className="text-white" />
          </span>
          <span className="text-sm font-medium text-white/90">
            One account, every Instanta business
          </span>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden">
        <Scene variant="auth" className="absolute inset-0" />
        <div
          className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/[0.06] blur-[80px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-10 -left-10 size-56 rounded-full bg-white/[0.05] blur-[70px]"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="inline-flex w-fit">
            <Image
              src="/brand/logo-dark-bg-96h.png"
              alt="Instanta"
              width={160}
              height={48}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <div className="max-w-sm">
            <FadeInWhenVisible>
              <h2 className="text-[30px] leading-[1.15] font-semibold m-0 mb-3 tracking-tight">
                {heading}
              </h2>
              <p className="text-[15px] text-white/70 m-0 mb-9 leading-relaxed">{blurb}</p>
            </FadeInWhenVisible>
            <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
              {BULLETS.map((b, i) => (
                <FadeInWhenVisible key={b.label} delay={0.1 + i * 0.07} y={10}>
                  <li className="flex items-center gap-3 text-sm text-white/85">
                    <span className="flex items-center justify-center size-8 rounded-full bg-white/10 ring-1 ring-white/15 shrink-0">
                      <Icon name={b.icon} size={15} />
                    </span>
                    {b.label}
                  </li>
                </FadeInWhenVisible>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40 m-0">
            &copy; <CurrentYear /> Instanta
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-10 px-4 lg:py-16 relative">
        <div
          className="pointer-events-none absolute top-8 right-[10%] size-64 rounded-full bg-accent/[0.06] blur-[90px] hidden lg:block"
          aria-hidden="true"
        />
        <FadeInWhenVisible className="w-full flex justify-center" y={12}>
          {children}
        </FadeInWhenVisible>
      </div>
    </div>
  );
}
