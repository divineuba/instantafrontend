import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Icon } from "@/components/ui/icon";
import { LinkButton } from "@/components/ui/button";
import { ConfirmedActions } from "@/components/travels/confirmed-actions";
import { getBooking } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// See app/travels/detail/page.tsx same reasoning: depends on ?booking= and
// a live fetch (plus a possible redirect), so there's no static shell worth
// prerendering.
export const instant = false;

// Deterministic pseudo-QR render keyed off the booking reference purely
// decorative (there is no real boarding-pass barcode standard implemented
// here), but stable per booking so the same ref always renders the same
// pattern instead of looking random on every page load.
function renderQr(seedStr: string) {
  let seed = seedStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 7);
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const cells: boolean[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const inFinder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      const finder = [[0, 0], [14, 0], [0, 14]].find(([cx, cy]) => inFinder(cx, cy));
      if (finder) {
        const dx = x - finder[0];
        const dy = y - finder[1];
        cells.push(dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      } else {
        cells.push(rnd() > 0.52);
      }
    }
  }
  return cells;
}

export default async function TravelsConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  if (!bookingId) notFound();

  const booking = await getBooking(bookingId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!booking) notFound();
  if (booking.status !== "CONFIRMED") redirect(`/travels/payment?booking=${booking.id}`);

  const { offer } = booking;
  const qr = renderQr(booking.bookingRef);

  const ticket = [
    { k: "Passenger", v: `${booking.passengerFirstName} ${booking.passengerLastName}` },
    { k: "Flight", v: offer.outboundFlightNo },
    { k: "Date", v: offer.outboundDate },
    { k: "Departs", v: offer.outboundDepart },
    { k: "Arrives", v: offer.outboundArrive },
    { k: "Terminal", v: "T1 → T5" },
    { k: "Class", v: `${offer.cabinClass} · Y` },
    { k: "Baggage", v: offer.baggage },
  ];

  return (
    <>
      <Header business="travels" active="results" />
      <main className="flex-1 ins-container pt-10 pb-24 flex flex-col gap-7 max-w-[1100px]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="size-12 rounded-[10px] bg-accent-100 text-accent-700 flex items-center justify-center shrink-0">
            <Icon name="check" size={26} />
          </span>
          <div className="mr-auto">
            <h1 className="text-[clamp(28px,4vw,42px)] leading-[1.05] m-0">Booking confirmed</h1>
            <div className="text-sm text-neutral-700">
              Your e-ticket has been sent to {booking.contactEmail} and saved in your account.
            </div>
          </div>
          <LinkButton href="/account/trips" variant="secondary">
            View my trips
          </LinkButton>
        </div>

        <article className="border border-divider rounded-xl bg-card shadow-md grid md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="p-7 flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="size-5 rounded-[6px] bg-accent relative block" />
                <span className="text-base font-semibold tracking-[.1em]">INSTANTA TRAVELS</span>
              </div>
              <span className="text-[11px] tracking-[.14em] uppercase text-neutral-600">
                E-ticket · Itinerary receipt
              </span>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 sm:gap-6 items-center">
              <div>
                <div className="text-[36px] sm:text-[64px] md:text-[88px] font-semibold leading-[.9]">{offer.originCode}</div>
                <div className="text-[13px] text-neutral-700">{offer.originCity}</div>
              </div>
              <div className="flex items-center gap-2.5 text-accent">
                <span className="flex-1 border-t border-dashed border-accent" />
                <Icon name="plane" size={24} />
                <span className="flex-1 border-t border-dashed border-accent" />
              </div>
              <div className="text-right">
                <div className="text-[36px] sm:text-[64px] md:text-[88px] font-semibold leading-[.9]">{offer.destinationCode}</div>
                <div className="text-[13px] text-neutral-700">{offer.destinationCity}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {ticket.map((t) => (
                <div key={t.k} className="p-3 border border-divider rounded-xl bg-bg">
                  <div className="text-[11px] tracking-[.1em] uppercase text-neutral-600">{t.k}</div>
                  <div className="text-lg font-semibold">{t.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-dashed border-neutral-400 p-7 flex flex-col items-center gap-3.5">
            <div className="text-[11px] tracking-[.1em] uppercase text-neutral-600">Booking reference</div>
            <div className="text-[32px] font-semibold tracking-[.12em] leading-none">{booking.bookingRef}</div>
            <div className="grid grid-cols-[repeat(21,1fr)] gap-0 w-[168px] h-[168px] border-[6px] border-bg outline outline-1 outline-divider">
              {qr.map((on, i) => (
                <span key={i} className={on ? "bg-text" : "bg-transparent"} />
              ))}
            </div>
            <div className="text-xs text-neutral-600 text-center">Show at check-in and bag drop</div>
          </div>
        </article>

        <div className="flex gap-2.5 flex-wrap items-center">
          <ConfirmedActions
            bookingRef={booking.bookingRef}
            summary={`${offer.outboundFlightNo} ${offer.originCode} to ${offer.destinationCode} on ${offer.outboundDate}`}
            startIso={offer.outboundDate.replace(/[^0-9]/g, "")}
          />
          <Link
            href="/logistics/book"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-accent-700 no-underline hover:underline"
          >
            <Icon name="package" size={16} />
            Need something delivered to the airport?
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
