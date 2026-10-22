import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

const SPACES = [
  { id: "logistics", label: "Logistics", dot: "var(--space-logistics)" },
  { id: "travels", label: "Travels", dot: "var(--space-travels)" },
  { id: "crypto", label: "Crypto", dot: "var(--space-crypto)" },
  { id: "love", label: "Love", dot: "var(--space-love)" },
] as const;

// Statements about how sign-in actually works (see backend auth module),
// not marketing claims.
const FACTS: { icon: IconName; label: string }[] = [
  { icon: "grid", label: "The same email and password work in every Instanta service" },
  { icon: "lock", label: "Your session is kept in a secure cookie, never in page scripts" },
  { icon: "shield", label: "Changing your password signs you out on every other device" },
];

/**
 * Focused layout for the sign-in pages: no site navigation to get lost in,
 * just the logo home, the form, and a way to get help. On large screens a
 * brand panel sits beside the form.
 */
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
    <div className="flex-1 flex flex-col lg:flex-row min-h-dvh">
      <aside
        aria-label="About your Instanta account"
        className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(155deg, #241a21 0%, #4a2f3f 52%, #714b67 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1.2px, transparent 1.2px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between gap-10 p-12 xl:p-14 text-white w-full">
          <Link
            href="/"
            className="inline-flex w-fit rounded-md focus-visible:outline-white"
          >
            <Image
              src="/brand/logo-dark-bg-96h.png"
              alt="Instanta home"
              width={363}
              height={96}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <div className="max-w-[26rem]">
            <p className="text-[30px] xl:text-[34px] leading-[1.12] font-semibold m-0 mb-3 tracking-tight font-heading">
              {heading}
            </p>
            <p className="text-[15px] text-white/80 m-0 mb-8 leading-relaxed">{blurb}</p>

            <ul className="flex flex-wrap gap-2 m-0 mb-9 p-0 list-none" aria-label="Services">
              {SPACES.map((s) => (
                <li
                  key={s.id}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1.5 text-[13px] font-medium text-white"
                >
                  <span
                    className="size-2 rounded-full ring-2 ring-white/30"
                    style={{ background: s.dot }}
                    aria-hidden="true"
                  />
                  {s.label}
                </li>
              ))}
            </ul>

            <ul className="flex flex-col gap-4 m-0 p-0 list-none">
              {FACTS.map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm text-white/90 leading-snug">
                  <span
                    className="flex items-center justify-center size-8 rounded-full bg-white/10 ring-1 ring-white/15 shrink-0 -mt-1"
                    aria-hidden="true"
                  >
                    <Icon name={f.icon} size={15} />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <AuthLinks tone="dark" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 px-4 sm:px-8 h-16 shrink-0">
          <Link href="/" className="inline-flex rounded-md lg:invisible">
            <Image
              src="/brand/logo-96h.png"
              alt="Instanta home"
              width={363}
              height={96}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 min-h-11 px-2 -mr-2 text-sm font-medium text-neutral-700 hover:text-accent-700"
          >
            <Icon name="help" size={16} aria-hidden="true" />
            Help
          </Link>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="flex-1 flex items-start sm:items-center justify-center px-4 pt-4 pb-10 sm:py-10 outline-none"
        >
          {children}
        </main>

        <footer className="lg:hidden px-4 pb-6">
          <AuthLinks tone="light" />
        </footer>
      </div>
    </div>
  );
}

function AuthLinks({ tone }: { tone: "light" | "dark" }) {
  const cls =
    tone === "dark"
      ? "text-white/75 hover:text-white"
      : "text-neutral-600 hover:text-accent-700";
  return (
    <nav aria-label="Legal and help">
      <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 m-0 p-0 list-none text-[13px]">
        <li>
          <Link href="/privacy" className={`inline-flex items-center min-h-11 ${cls}`}>
            Privacy
          </Link>
        </li>
        <li>
          <Link href="/terms" className={`inline-flex items-center min-h-11 ${cls}`}>
            Terms
          </Link>
        </li>
        <li>
          <Link href="/support" className={`inline-flex items-center min-h-11 ${cls}`}>
            Support
          </Link>
        </li>
      </ul>
    </nav>
  );
}
