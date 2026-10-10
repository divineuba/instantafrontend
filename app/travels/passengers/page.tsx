import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { FlowBar } from "@/components/travels/flow-bar";
import { PassengerForm } from "@/components/travels/passenger-form";
import { getOffer } from "@/lib/travels";
import { ApiError } from "@/lib/api";

// See app/travels/detail/page.tsx same reasoning: depends on ?offer= and
// a live fetch, so there's no static shell worth prerendering.
export const instant = false;

export default async function TravelsPassengersPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const { offer: offerId } = await searchParams;
  if (!offerId) notFound();

  const offer = await getOffer(offerId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!offer) notFound();

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${offer.originCity} to ${offer.destinationCity}, return`}
        dateLabel={`${offer.outboundDate} → ${offer.returnDate}`}
        step={2}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <PassengerForm offer={offer} />
      </main>
      <Footer />
    </>
  );
}
