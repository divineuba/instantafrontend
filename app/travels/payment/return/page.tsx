import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { PaymentReturnStatus } from "@/components/travels/payment-return-status";
import { bookingHref, getBooking } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// Depends on ?booking=/?key= and a live fetch, so there's no static shell
// worth prerendering — same reasoning as the other booking-flow pages.
export const instant = false;

export default async function TravelsPaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; key?: string; status?: string }>;
}) {
  const { booking: bookingId, key, status } = await searchParams;
  if (!bookingId || !key) notFound();

  const booking = await getBooking(bookingId, key).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!booking) notFound();

  // The customer backed out of the hosted checkout without paying — nothing
  // for our backend to confirm, so there's nothing to poll for.
  if (status === "cancel") redirect(bookingHref("payment", booking));
  if (booking.status === "CONFIRMED") redirect(bookingHref("confirmed", booking));

  return (
    <>
      <Header business="travels" active="results" />
      <main className="flex-1 ins-container pt-8 pb-24">
        <PaymentReturnStatus booking={booking} accessKey={key} />
      </main>
      <Footer />
    </>
  );
}
