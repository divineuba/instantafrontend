import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { FlowBar } from "@/components/travels/flow-bar";
import { PaymentForm } from "@/components/travels/payment-form";
import { getBooking, tripTypeLabel } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// See app/travels/detail/page.tsx same reasoning: depends on ?booking= and
// a live fetch, so there's no static shell worth prerendering.
export const instant = false;

export default async function TravelsPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; key?: string }>;
}) {
  const { booking: bookingId, key } = await searchParams;
  if (!bookingId) notFound();

  const booking = await getBooking(bookingId, key).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!booking) notFound();

  const legs = booking.offer.legs;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${firstLeg.originCity} to ${lastLeg.destinationCity}, ${tripTypeLabel(booking.tripType)}`}
        dateLabel={legs.map((l) => l.date).join(" → ")}
        step={3}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
        <PaymentForm booking={booking} />
      </main>
      <Footer />
    </>
  );
}
