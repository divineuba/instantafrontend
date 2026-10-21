import type { IconName } from "@/components/ui/icon";
import { apiFetch } from "@/lib/api";

export type DeliverySpeedKey = "STANDARD" | "EXPRESS" | "SAME_DAY" | "SCHEDULED";
export type WeightBandKey = "UP_TO_5KG" | "FROM_5_TO_20KG" | "FROM_20_TO_50KG";
export type DeliveryStatusKey =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface SpeedOption {
  key: DeliverySpeedKey;
  name: string;
  icon: IconName;
  time: string;
  best: string;
  price: number;
}

/** Mirrors backend PricingService's seeded SPEED rules kept in sync by hand. */
export const SPEEDS: SpeedOption[] = [
  { key: "STANDARD", name: "Standard", icon: "package", time: "Within 1–2 days", best: "Non-urgent parcels", price: 6.5 },
  { key: "EXPRESS", name: "Express", icon: "truck", time: "Within 4 hours", best: "Documents and small parcels", price: 9.0 },
  { key: "SAME_DAY", name: "Same-day", icon: "zap", time: "Today, book by 3 pm", best: "Urgent deliveries", price: 12.0 },
  { key: "SCHEDULED", name: "Scheduled", icon: "calendar", time: "Pick a 2-hour window", best: "Planned pickups", price: 7.5 },
];

export interface WeightBandOption {
  key: WeightBandKey;
  label: string;
  surcharge: number;
}

export const WEIGHT_BANDS: WeightBandOption[] = [
  { key: "UP_TO_5KG", label: "Up to 5 kg", surcharge: 0 },
  { key: "FROM_5_TO_20KG", label: "5–20 kg", surcharge: 2.0 },
  { key: "FROM_20_TO_50KG", label: "20–50 kg", surcharge: 6.0 },
];

export const INSURANCE_FEE = 1.2;
export const PER_KM_RATE = 0.21;

export function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  fullAddress: string;
}

/**
 * Thin wrapper around Mapbox's Geocoding API for address-field autocomplete,
 * called directly from the browser with the public, domain-restricted
 * `NEXT_PUBLIC_MAPBOX_TOKEN` (see INTEGRATIONS.md). This is a UI convenience
 * only — the backend re-geocodes whichever address string the user submits
 * itself (`GeocodingProvider`), rather than trusting any client-supplied
 * coordinates, so an empty token here just means no autocomplete dropdown,
 * not a broken quote/booking flow.
 */
export async function suggestAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || query.trim().length < 3) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: { id: string; place_name: string; text: string }[] };
  return (data.features ?? []).map((f) => ({ id: f.id, label: f.text, fullAddress: f.place_name }));
}

export interface ServiceHowStep {
  n: number;
  t: string;
}

export interface ServiceBenefit {
  t: string;
  d: string;
}

export interface LogisticsService {
  slug: string;
  name: string;
  icon: IconName;
  title: string;
  desc: string;
  short: string;
  cta: string;
  ctaBand: string;
  price: string;
  priceNote: string;
  benefits: ServiceBenefit[];
  how: ServiceHowStep[];
}

const HOW: ServiceHowStep[] = [
  { n: 1, t: "Book online or in the app" },
  { n: 2, t: "A rider collects from your door" },
  { n: 3, t: "Track it live on the map" },
  { n: 4, t: "Recipient confirms with a PIN" },
];

export const LOGISTICS_SERVICES: Record<string, LogisticsService> = {
  personal: {
    slug: "personal",
    name: "Personal delivery",
    icon: "package",
    title: "Send to anyone, anywhere in the city.",
    desc: "Gifts, documents, items you sold online. Book in a minute and we collect from your door.",
    short: "Parcels, documents and gifts, door to door.",
    cta: "Send a package",
    ctaBand: "Ready to send something?",
    price: "From $6.50",
    priceNote: "Flat price by distance band and weight. You see the full price before you pay.",
    how: HOW,
    benefits: [
      { t: "Door-to-door", d: "Pickup and drop-off at any address." },
      { t: "Fixed price", d: "No surge pricing, ever." },
      { t: "Live tracking", d: "You and your recipient see the rider." },
      { t: "Proof of delivery", d: "PIN confirmation on every drop." },
    ],
  },
  "same-day": {
    slug: "same-day",
    name: "Same-day delivery",
    icon: "zap",
    title: "Picked up within the hour. Delivered today.",
    desc: "Book before 3 pm and your parcel arrives the same day, anywhere within the city.",
    short: "Book before 3 pm, delivered the same day.",
    cta: "Book same-day",
    ctaBand: "Need it there today?",
    price: "From $12.00",
    priceNote: "A fixed same-day rate per city zone, plus weight above 5 kg.",
    how: HOW,
    benefits: [
      { t: "60-minute pickup", d: "A rider at your door within the hour." },
      { t: "Guaranteed today", d: "Or your delivery fee back." },
      { t: "Priority riders", d: "Direct routes, no pooling." },
      { t: "Live ETA", d: "Updated every 30 seconds." },
    ],
  },
  business: {
    slug: "business",
    name: "Business delivery",
    icon: "briefcase",
    title: "Deliveries your customers can count on.",
    desc: "For shops, restaurants and online sellers who deliver every day.",
    short: "Daily deliveries for shops and SMEs.",
    cta: "Open a business account",
    ctaBand: "Deliver more, for less.",
    price: "Volume rates",
    priceNote: "Tiered per-delivery rates from 100 deliveries a month, billed monthly.",
    how: HOW,
    benefits: [
      { t: "Monthly billing", d: "One invoice for every delivery." },
      { t: "Branded tracking", d: "Your name on the tracking page." },
      { t: "Cash on delivery", d: "We collect and settle within 24 h." },
      { t: "Team access", d: "Staff book under one account." },
    ],
  },
  scheduled: {
    slug: "scheduled",
    name: "Scheduled delivery",
    icon: "calendar",
    title: "Pick the day. Pick the time.",
    desc: "Book pickups up to 14 days ahead in two-hour windows.",
    short: "Pickup slots up to 14 days ahead.",
    cta: "Schedule a pickup",
    ctaBand: "Plan your next delivery.",
    price: "From $7.50",
    priceNote: "Standard pricing plus a small scheduling fee. Free to reschedule up to 2 h before.",
    how: HOW,
    benefits: [
      { t: "Two-hour windows", d: "Know exactly when we arrive." },
      { t: "Recurring", d: "Daily, weekly or monthly runs." },
      { t: "Reminders", d: "SMS the day before and on the way." },
      { t: "Free changes", d: "Reschedule up to 2 h before." },
    ],
  },
  bulk: {
    slug: "bulk",
    name: "Bulk delivery",
    icon: "layers",
    title: "Hundreds of drops. One upload.",
    desc: "Upload a spreadsheet of addresses and we plan routes, assign riders and report back.",
    short: "Many drop-offs from one spreadsheet.",
    cta: "Upload a delivery list",
    ctaBand: "Moving volume?",
    price: "Per drop",
    priceNote: "A per-drop rate that falls as volume rises. Quote within one business day.",
    how: HOW,
    benefits: [
      { t: "CSV upload", d: "Paste or upload your list." },
      { t: "Route planning", d: "Optimised across our fleet." },
      { t: "Status report", d: "Every drop, exported." },
      { t: "Failed-drop retries", d: "Two retries included." },
    ],
  },
  corporate: {
    slug: "corporate",
    name: "Corporate logistics",
    icon: "building",
    title: "A logistics partner for your whole company.",
    desc: "Dedicated riders and vans, SLAs and integrations for companies moving goods every day.",
    short: "Dedicated fleet, SLAs and reporting.",
    cta: "Talk to sales",
    ctaBand: "Build your logistics with us.",
    price: "Custom",
    priceNote: "Contracted rates set on volume, routes and service level.",
    how: HOW,
    benefits: [
      { t: "Dedicated fleet", d: "Riders and vans assigned to you." },
      { t: "SLA reporting", d: "Monthly performance against targets." },
      { t: "API access", d: "Book from your own systems." },
      { t: "Account manager", d: "One named contact." },
    ],
  },
};

export interface QuoteRequest {
  pickupAddress: string;
  destinationAddress: string;
  speed: DeliverySpeedKey;
  weightBand: WeightBandKey;
  insured?: boolean;
}

export interface PriceBreakdownItem {
  label: string;
  amount: number;
}

export interface QuoteResponse {
  speedPrice: number;
  distanceSurcharge: number;
  weightSurcharge: number;
  insuranceFee: number;
  total: number;
  breakdown: PriceBreakdownItem[];
  /** Real road-route figures from the backend's Mapbox geocoding seam. */
  distanceKm: number;
  durationMin: number;
}

export interface CreateDeliveryRequest extends QuoteRequest {
  pickupContact: string;
  pickupPhone: string;
  destinationContact: string;
  destinationPhone: string;
  packageDescription: string;
  fragile?: boolean;
  notes?: string;
  /** Required when `speed` is SCHEDULED; the booked pickup window's start time. */
  scheduledFor?: string;
  workspaceId?: string;
}

export interface DeliveryPackage {
  description: string;
  weightBand: WeightBandKey;
  fragile: boolean;
  notes: string | null;
}

export interface Delivery {
  id: string;
  trackingId: string;
  pickupAddress: string;
  pickupContact: string;
  pickupPhone: string;
  pickupLat: string | null;
  pickupLng: string | null;
  destinationAddress: string;
  destinationContact: string;
  destinationPhone: string;
  destLat: string | null;
  destLng: string | null;
  /** GeoJSON [lng, lat] coordinate pairs for the real road route; null for
   * pre-Phase-14.0 deliveries or if geocoding never ran. */
  routePolyline: [number, number][] | null;
  speed: DeliverySpeedKey;
  distanceKm: string;
  insured: boolean;
  scheduledFor: string | null;
  speedPrice: string;
  distanceSurcharge: string;
  weightSurcharge: string;
  insuranceFee: string;
  total: string;
  status: DeliveryStatusKey;
  riderId: string | null;
  riderName: string | null;
  riderPhone: string | null;
  eta: string | null;
  package: DeliveryPackage | null;
  createdAt: string;
  updatedAt: string;
  trackState: "picked" | "transit" | "out" | "delivered" | "notfound";
}

export interface DeliveryMessage {
  id: string;
  deliveryId: string;
  sender: "CUSTOMER" | "SUPPORT";
  senderName: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function quoteDelivery(req: QuoteRequest) {
  return apiFetch<QuoteResponse>("/deliveries/quote", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function createDelivery(req: CreateDeliveryRequest) {
  return apiFetch<Delivery>("/deliveries", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function trackDelivery(trackingId: string) {
  return apiFetch<Delivery>(`/deliveries/${encodeURIComponent(trackingId)}`);
}

export function listDeliveryMessages(trackingId: string) {
  return apiFetch<DeliveryMessage[]>(`/deliveries/${encodeURIComponent(trackingId)}/messages`);
}

export function sendDeliveryMessage(trackingId: string, body: string) {
  return apiFetch<DeliveryMessage>(`/deliveries/${encodeURIComponent(trackingId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export const LOGISTICS_FAQS = [
  {
    q: "What can't I send?",
    a: "Cash, weapons, illegal substances, live animals and perishables without insulated packaging.",
  },
  {
    q: "What happens if nobody is home?",
    a: "The rider calls the recipient and waits up to 10 minutes. After that we return the parcel or try again, as you choose.",
  },
  {
    q: "Is my package insured?",
    a: "Every delivery has basic cover up to $50. Add cover up to $500 at checkout.",
  },
  {
    q: "How do I pay?",
    a: "Card, Instanta wallet, bank transfer, or monthly invoice on a business account.",
  },
];
