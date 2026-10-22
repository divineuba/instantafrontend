"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { bookingHref, getBooking, type Booking } from "@/lib/travels";

const POLL_MS = 2500;
const SLOW_AFTER_MS = 20_000;

/**
 * Lands here after a hosted checkout redirect. The booking only flips to
 * CONFIRMED once the provider's webhook reaches our backend, which can race
 * the browser redirect, so this polls until it does (or the payment is
 * reported FAILED) rather than assuming either outcome up front.
 */
export function PaymentReturnStatus({
  booking: initialBooking,
  accessKey,
}: {
  booking: Booking;
  accessKey: string;
}) {
  const router = useRouter();
  const [booking, setBooking] = React.useState(initialBooking);
  const [slow, setSlow] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    async function tick() {
      try {
        const latest = await getBooking(booking.id, accessKey);
        if (cancelled) return;
        setBooking(latest);
        if (latest.status === "CONFIRMED") {
          router.push(bookingHref("confirmed", latest));
          return;
        }
        const lastPayment = latest.payments[latest.payments.length - 1];
        if (lastPayment?.status === "FAILED") {
          router.push(bookingHref("payment", latest));
          return;
        }
      } catch {
        // Transient fetch error — keep polling rather than giving up.
      }
      if (cancelled) return;
      if (Date.now() - startedAt > SLOW_AFTER_MS) setSlow(true);
      timer = setTimeout(tick, POLL_MS);
    }

    timer = setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id, accessKey, router]);

  return (
    <div className="flex flex-col items-center gap-4 text-center py-20">
      <span className="size-12 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center animate-pulse">
        <Icon name="card" size={22} />
      </span>
      <h1 className="text-2xl font-semibold m-0">Confirming your payment…</h1>
      <p className="text-sm text-neutral-700 max-w-md m-0">
        {slow
          ? "This is taking longer than usual, but your fare is still held — hang tight, we're still waiting to hear back from the payment provider."
          : "We're waiting for the payment provider to confirm this charge. This page will move on automatically."}
      </p>
    </div>
  );
}
