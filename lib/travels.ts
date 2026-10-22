import { ApiError, apiFetch } from "@/lib/api";

export function fmtUsd(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return `$${v.toFixed(2).replace(/\.00$/, "")}`;
}

export interface PopularRoute {
  id: string;
  code: string;
  city: string;
  meta: string;
  price: string;
  sortOrder: number;
}

export interface FlightOfferLeg {
  id: string;
  sequence: number;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  flightNo: string;
  depart: string;
  arrive: string;
  date: string;
  durationMin: number;
  stops: number;
  stopsLabel: string;
}

export interface FlightOffer {
  id: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  airlineCode: string;
  airlineName: string;
  fareLabel: string;
  cabinClass: string;
  aircraft: string;
  baggage: string;
  changePolicy: string;
  price: string;
  legs: FlightOfferLeg[];
  createdAt: string;
  updatedAt: string;
}

export interface FlightOfferResult extends FlightOffer {
  hasBadge: boolean;
  badge: "Cheapest" | "Fastest" | null;
}

export type FlightSort = "recommended" | "cheapest" | "fastest" | "earliest";
export type DepartTimeBand = "night" | "morning" | "afternoon" | "evening";
export type CabinClass = "Economy" | "Premium" | "Business" | "First";

export interface SearchFlightLeg {
  origin: string;
  destination: string;
  departDate: string;
}

export interface SearchFlightsParams {
  legs: SearchFlightLeg[];
  adults?: number;
  cabinClass?: CabinClass;
  stops?: number[];
  airlines?: string[];
  maxPrice?: number;
  maxDurationMin?: number;
  departTimeBand?: DepartTimeBand;
  sort?: FlightSort;
}

export interface SortSummary {
  key: FlightSort;
  label: string;
}

export interface AirlineFilter {
  code: string;
  name: string;
  count: number;
}

export interface StopCount {
  stops: number;
  fromPrice: number;
}

export interface SearchFlightsResponse {
  resultCount: number;
  noResults: boolean;
  offers: FlightOfferResult[];
  sortSummaries: SortSummary[];
  airlines: AirlineFilter[];
  stopCounts: StopCount[];
}

export function getPopularRoutes() {
  return apiFetch<PopularRoute[]>("/flights/routes");
}

/** Live search providers reject past departure dates, so defaults need to
 * float with "today" rather than being a fixed string. */
function isoDatePlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultDepartDate() {
  return isoDatePlusDays(30);
}

export function defaultReturnDate() {
  return isoDatePlusDays(44);
}

export function searchFlights(params: SearchFlightsParams) {
  return apiFetch<SearchFlightsResponse>("/flights/search", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function getOffer(id: string) {
  return apiFetch<FlightOffer>(`/flights/offers/${encodeURIComponent(id)}`);
}

export interface ConfirmedFlightPrice {
  price: number;
  currency: string;
  /** Fare breakdown as the airline returned it; null when a part wasn't provided. */
  base: number | null;
  taxes: number | null;
  fees: number | null;
  fareRules: string[];
}

export function confirmPrice(offerId: string) {
  return apiFetch<ConfirmedFlightPrice>(`/flights/offers/${encodeURIComponent(offerId)}/price`, {
    method: "POST",
  });
}

export interface SeatMapSeat {
  number: string;
  available: boolean;
  characteristics: string[];
  priceAmount?: string;
  priceCurrency?: string;
}

export interface SeatMapRow {
  rowNumber: string;
  seats: SeatMapSeat[];
}

export interface SeatMapDeck {
  deckType: string;
  rows: SeatMapRow[];
}

export function getSeatMap(offerId: string) {
  return apiFetch<SeatMapDeck[]>(`/flights/offers/${encodeURIComponent(offerId)}/seatmap`);
}

export type TravelerType = "ADULT" | "CHILD" | "INFANT";

export interface PassengerInput {
  type?: TravelerType;
  savedPassengerId?: string;
  title: "Mr" | "Ms" | "Mx";
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female";
  nationality: string;
  /** Required unless savedPassengerId is set; the server then uses the number on file. */
  passportNumber?: string;
  passportCountry: string;
  passportExpiry: string;
}

export interface CreateBookingRequest {
  offerId: string;
  passengers: PassengerInput[];
  specialRequests?: string[];
  contactEmail: string;
  contactPhone: string;
  workspaceId?: string;
  /** The total the traveler was shown. The backend re-confirms the fare and
   * answers 409 PRICE_CHANGED instead of booking if it no longer matches. */
  expectedTotal?: number;
}

/** The new fare from a 409 PRICE_CHANGED response, or null for any other error. */
export function changedFare(err: unknown): number | null {
  if (!(err instanceof ApiError) || err.status !== 409) return null;
  const body = err.body as { code?: unknown; price?: unknown } | null;
  return body?.code === "PRICE_CHANGED" && typeof body.price === "number" ? body.price : null;
}

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
export type TripType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";
export type PaymentMethodKey = "CARD" | "WALLET" | "BANK_TRANSFER" | "BUSINESS";
export type PaymentStatusKey = "SUCCESS" | "FAILED";
export type TravelDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RefundRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethodKey;
  status: PaymentStatusKey;
  amount: string;
  cardLast4: string | null;
  createdAt: string;
}

export interface BookingPassenger {
  id: string;
  bookingId: string;
  savedPassengerId: string | null;
  type: TravelerType;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
}

export interface TravelDocument {
  id: string;
  bookingId: string;
  key: string;
  url: string;
  label: string;
  status: TravelDocumentStatus;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  reason: string | null;
  status: RefundRequestStatus;
  decidedAt: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  /** Capability key from the backend: the owner or anyone holding it can
   * load/pay this booking. Carried in the payment/confirmed page links. */
  accessKey: string;
  bookingRef: string;
  offerId: string;
  offer: FlightOffer;
  tripType: TripType;
  adults: number;
  passengers: BookingPassenger[];
  specialRequests: string[];
  contactEmail: string;
  contactPhone: string;
  baseFare: string;
  taxes: string;
  fees: string;
  total: string;
  status: BookingStatus;
  payments: Payment[];
  documents: TravelDocument[];
  refundRequests: RefundRequest[];
  createdAt: string;
  updatedAt: string;
}

export function createBooking(req: CreateBookingRequest) {
  return apiFetch<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

function bookingKeyHeaders(accessKey: string | undefined): HeadersInit {
  return accessKey ? { "X-Booking-Key": accessKey } : {};
}

/** Link to a booking's payment or confirmation page, carrying its access key. */
export function bookingHref(page: "payment" | "confirmed", booking: Pick<Booking, "id" | "accessKey">) {
  return `/travels/${page}?booking=${encodeURIComponent(booking.id)}&key=${encodeURIComponent(booking.accessKey)}`;
}

export function getBooking(id: string, accessKey?: string) {
  return apiFetch<Booking>(`/bookings/${encodeURIComponent(id)}`, { headers: bookingKeyHeaders(accessKey) });
}

export interface PayBookingRequest {
  method: PaymentMethodKey;
  cardNumber?: string;
}

export interface PayBookingResponse {
  payment: Payment;
  booking: Booking;
}

export function payBooking(id: string, accessKey: string, req: PayBookingRequest) {
  return apiFetch<PayBookingResponse>(`/bookings/${encodeURIComponent(id)}/payment`, {
    method: "POST",
    headers: bookingKeyHeaders(accessKey),
    body: JSON.stringify(req),
  });
}

export interface LegFlightStatus {
  sequence: number;
  flightNo: string;
  flightStatus: "SCHEDULED" | "ON_TIME" | "DELAYED" | "DEPARTED" | "ARRIVED" | "CANCELLED" | "UNKNOWN";
  departureTerminal?: string;
  departureGate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
}

export function getFlightStatus(bookingId: string, accessKey: string) {
  return apiFetch<{ statuses: LegFlightStatus[] }>(`/bookings/${encodeURIComponent(bookingId)}/status`, {
    headers: bookingKeyHeaders(accessKey),
  });
}

export function cancelBooking(bookingId: string, reason?: string) {
  return apiFetch<Booking>(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export type TravelDocContentType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

export function presignTravelDocument(bookingId: string, contentType: TravelDocContentType) {
  return apiFetch<PresignedUpload>(`/bookings/${encodeURIComponent(bookingId)}/documents/presign`, {
    method: "POST",
    body: JSON.stringify({ contentType }),
  });
}

export function addTravelDocument(bookingId: string, input: { key: string; url: string; label: string }) {
  return apiFetch<TravelDocument>(`/bookings/${encodeURIComponent(bookingId)}/documents`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export const TRAVEL_WHY = [
  {
    icon: "search" as const,
    t: "Compare in one search",
    d: "Fares from full-service and low-cost airlines side by side.",
  },
  {
    icon: "file" as const,
    t: "Tickets in your account",
    d: "E-tickets, itineraries and receipts kept with your deliveries and payments.",
  },
  {
    icon: "chat" as const,
    t: "Help when plans change",
    d: "Changes, cancellations and refunds handled by our travel desk.",
  },
];

export const SPECIAL_REQUESTS = [
  "Wheelchair assistance",
  "Special meal",
  "Travelling with infant",
  "Frequent flyer number",
];

export function minutesToHm(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function tripTypeLabel(t: TripType) {
  switch (t) {
    case "ONE_WAY":
      return "one-way";
    case "MULTI_CITY":
      return "multi-city";
    case "ROUND_TRIP":
    default:
      return "return";
  }
}
