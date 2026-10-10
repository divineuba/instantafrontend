import type { IconName } from "@/components/ui/icon";

export type BusinessStatus = "live" | "soon";

export interface BusinessLink {
  label: string;
  href: string;
}

export interface BusinessSubnavItem {
  key: string;
  label: string;
  href: string;
}

export interface Business {
  id: string;
  /** Short wordmark shown next to the group logo, e.g. "LOGISTICS" */
  name: string;
  /** Full display label, e.g. "Instanta Logistics" */
  label: string;
  icon: IconName;
  status: BusinessStatus;
  tagline: string;
  /** Vertical home route */
  href: string;
  /** Primary CTA shown in the header sub-nav row */
  cta: BusinessLink;
  /** Label for the "Explore <business>" link in the mega menu column */
  exploreLabel: string;
  /** Links shown in the header mega menu column for this business */
  megaItems: BusinessLink[];
  /** Links shown in the header's vertical sub-nav row (row 2) */
  subnav: BusinessSubnavItem[];
  /** Links shown in the footer column for this business */
  footerLinks: BusinessLink[];
}

export interface ComingSoonBusiness {
  id: string;
  label: string;
  icon: IconName;
}

/**
 * Single source of truth for every business vertical on the platform.
 * Drives the header mega menu, the vertical sub-nav row, the footer
 * columns, and (later) the services directory and admin business
 * switcher adding a business is a data change here, not a redesign.
 */
export const businesses: Business[] = [
  {
    id: "logistics",
    name: "LOGISTICS",
    label: "Instanta Logistics",
    icon: "truck",
    status: "live",
    tagline: "Move anything, anywhere.",
    href: "/logistics",
    cta: { label: "Send a package", href: "/logistics/book" },
    exploreLabel: "Explore Logistics",
    megaItems: [
      { label: "Delivery", href: "/logistics/book" },
      { label: "Same-day delivery", href: "/logistics/services/same-day" },
      { label: "Business logistics", href: "/logistics/services/business" },
      { label: "Package tracking", href: "/logistics/track" },
      { label: "Corporate logistics", href: "/logistics/services/corporate" },
    ],
    subnav: [
      { key: "home", label: "Overview", href: "/logistics" },
      { key: "book", label: "Send a package", href: "/logistics/book" },
      { key: "track", label: "Track", href: "/logistics/track" },
      {
        key: "same-day",
        label: "Same-day",
        href: "/logistics/services/same-day",
      },
      {
        key: "business",
        label: "Business delivery",
        href: "/logistics/services/business",
      },
      {
        key: "corporate",
        label: "Corporate logistics",
        href: "/logistics/services/corporate",
      },
    ],
    footerLinks: [
      { label: "Send a package", href: "/logistics/book" },
      { label: "Track delivery", href: "/logistics/track" },
      { label: "Same-day delivery", href: "/logistics/services/same-day" },
      { label: "Business delivery", href: "/logistics/services/business" },
    ],
  },
  {
    id: "travels",
    name: "TRAVELS",
    label: "Instanta Travels",
    icon: "plane",
    status: "live",
    tagline: "Go further with confidence.",
    href: "/travels",
    cta: { label: "Search flights", href: "/travels" },
    exploreLabel: "Explore Travels",
    megaItems: [
      { label: "Flight booking", href: "/travels" },
      { label: "Travel services", href: "/services" },
      { label: "Corporate travel", href: "/business" },
      { label: "Travel assistance", href: "/account/support" },
    ],
    subnav: [
      { key: "home", label: "Flights", href: "/travels" },
      { key: "results", label: "Search results", href: "/travels/results" },
      { key: "manage", label: "Manage booking", href: "/account/trips" },
      { key: "corporate", label: "Corporate travel", href: "/business" },
      { key: "help", label: "Travel assistance", href: "/account/support" },
    ],
    footerLinks: [
      { label: "Book a flight", href: "/travels" },
      { label: "Manage booking", href: "/account/trips" },
      { label: "Corporate travel", href: "/business" },
      { label: "Travel assistance", href: "/account/support" },
    ],
  },
];

export const comingSoonBusinesses: ComingSoonBusiness[] = [
  { id: "payments", label: "Payments", icon: "wallet" },
  { id: "hotels", label: "Hotels", icon: "bed" },
  { id: "car-rentals", label: "Car rentals", icon: "car" },
];

export function getBusiness(id: string): Business | undefined {
  return businesses.find((b) => b.id === id);
}
