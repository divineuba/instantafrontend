import { apiFetch } from "@/lib/api";

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
  outboundFlightNo: string;
  outboundDepart: string;
  outboundArrive: string;
  outboundDate: string;
  outboundDurationMin: number;
  outboundStops: number;
  outboundStopsLabel: string;
  returnFlightNo: string;
  returnDepart: string;
  returnArrive: string;
  returnDate: string;
  returnDurationMin: number;
  returnStops: number;
  returnStopsLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightOfferResult extends FlightOffer {
  hasBadge: boolean;
  badge: "Cheapest" | "Fastest" | null;
}

export type FlightSort = "recommended" | "cheapest" | "fastest" | "earliest";
export type DepartTimeBand = "night" | "morning" | "afternoon" | "evening";

export interface SearchFlightsParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
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

export function searchFlights(params: SearchFlightsParams = {}) {
  const qs = new URLSearchParams();
  if (params.origin) qs.set("origin", params.origin);
  if (params.destination) qs.set("destination", params.destination);
  if (params.departDate) qs.set("departDate", params.departDate);
  if (params.returnDate) qs.set("returnDate", params.returnDate);
  if (params.adults) qs.set("adults", String(params.adults));
  if (params.stops?.length) qs.set("stops", params.stops.join(","));
  if (params.airlines?.length) qs.set("airlines", params.airlines.join(","));
  if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice));
  if (params.maxDurationMin !== undefined)
    qs.set("maxDurationMin", String(params.maxDurationMin));
  if (params.departTimeBand) qs.set("departTimeBand", params.departTimeBand);
  if (params.sort) qs.set("sort", params.sort);
  const query = qs.toString();
  return apiFetch<SearchFlightsResponse>(`/flights/search${query ? `?${query}` : ""}`);
}

export function getOffer(id: string) {
  return apiFetch<FlightOffer>(`/flights/offers/${encodeURIComponent(id)}`);
}

export interface PassengerInput {
  title: "Mr" | "Ms" | "Mx";
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female";
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
}

export interface CreateBookingRequest {
  offerId: string;
  adults?: number;
  passenger: PassengerInput;
  specialRequests?: string[];
  contactEmail: string;
  contactPhone: string;
}

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
export type PaymentMethodKey = "CARD" | "WALLET" | "BANK_TRANSFER" | "BUSINESS";
export type PaymentStatusKey = "SUCCESS" | "FAILED";

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethodKey;
  status: PaymentStatusKey;
  amount: string;
  cardLast4: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  offerId: string;
  offer: FlightOffer;
  adults: number;
  passengerTitle: string;
  passengerFirstName: string;
  passengerLastName: string;
  passengerDob: string;
  passengerGender: string;
  passengerNationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  specialRequests: string[];
  contactEmail: string;
  contactPhone: string;
  baseFare: string;
  taxes: string;
  fees: string;
  total: string;
  status: BookingStatus;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export function createBooking(req: CreateBookingRequest) {
  return apiFetch<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function getBooking(id: string) {
  return apiFetch<Booking>(`/bookings/${encodeURIComponent(id)}`);
}

export interface PayBookingRequest {
  method: PaymentMethodKey;
  cardNumber?: string;
}

export interface PayBookingResponse {
  payment: Payment;
  booking: Booking;
}

export function payBooking(id: string, req: PayBookingRequest) {
  return apiFetch<PayBookingResponse>(`/bookings/${encodeURIComponent(id)}/payment`, {
    method: "POST",
    body: JSON.stringify(req),
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

export const FARE_RULES = [
  { icon: "briefcase" as const, k: "Checked baggage", v: "1 × 23 kg per passenger" },
  { icon: "package" as const, k: "Cabin baggage", v: "1 bag + 1 personal item" },
  { icon: "refresh" as const, k: "Changes", v: "$90 fee + fare difference" },
  { icon: "x" as const, k: "Cancellation", v: "Refund minus $150 before departure" },
  { icon: "user" as const, k: "Passenger info", v: "Passport required · UK visa may apply" },
  { icon: "clock" as const, k: "No-show", v: "Fare forfeited, taxes refundable" },
];

export function minutesToHm(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
