import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { FlowBar } from "@/components/travels/flow-bar";
import { PaymentForm } from "@/components/travels/payment-form";
import { getBooking } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// See app/travels/detail/page.tsx same reasoning: depends on ?booking= and
// a live fetch, so there's no static shell worth prerendering.
export const instant = false;

export default async function TravelsPaymentPage({
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

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${booking.offer.originCity} to ${booking.offer.destinationCity}, return`}
        dateLabel={`${booking.offer.outboundDate} → ${booking.offer.returnDate}`}
        step={3}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
        <PaymentForm booking={booking} />
      </main>
      <Footer />
    </>
  );
}
