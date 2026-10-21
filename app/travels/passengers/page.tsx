import { notFound } from "next/navigation";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { FlowBar } from "@/components/travels/flow-bar";
import { PassengerForm } from "@/components/travels/passenger-form";
import { getOffer, tripTypeLabel, type TripType } from "@/lib/travels";
import { getTrips } from "@/lib/account";
import { ApiError } from "@/lib/api";

// See app/travels/detail/page.tsx same reasoning: depends on ?offer= and
// a live fetch, so there's no static shell worth prerendering.
export const instant = false;

function tripTypeOf(legCount: number): TripType {
  if (legCount <= 1) return "ONE_WAY";
  if (legCount === 2) return "ROUND_TRIP";
  return "MULTI_CITY";
}

export default async function TravelsPassengersPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string; adults?: string }>;
}) {
  const { offer: offerId, adults: adultsParam } = await searchParams;
  if (!offerId) notFound();

  const offer = await getOffer(offerId).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!offer) notFound();

  const adults = Number(adultsParam ?? "1") || 1;
  const trips = await getTrips().catch(() => null);
  const savedPassengers = trips?.passengers ?? [];

  const firstLeg = offer.legs[0];
  const lastLeg = offer.legs[offer.legs.length - 1];
  const tripType = tripTypeOf(offer.legs.length);

  return (
    <>
      <Header business="travels" active="results" />
      <FlowBar
        routeLabel={`${firstLeg.originCity} to ${lastLeg.destinationCity}, ${tripTypeLabel(tripType)}`}
        dateLabel={offer.legs.map((l) => l.date).join(" → ")}
        step={2}
      />
      <main className="flex-1 ins-container pt-8 pb-24 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        <PassengerForm offer={offer} adults={adults} savedPassengers={savedPassengers} />
      </main>
      <Footer />
    </>
  );
}
