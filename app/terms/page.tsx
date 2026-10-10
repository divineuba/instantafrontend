import { LegalPage } from "@/components/legal/legal-page";

const SECTIONS = [
  {
    title: "Using Instanta",
    body: "By creating an account or placing an order you agree to these terms. You must be able to form a binding contract to use the service, and keep your account details accurate and secure.",
  },
  {
    title: "Orders and bookings",
    body: "Placing a delivery or booking a trip is an offer to buy at the price shown at checkout. We'll confirm your order once it's accepted; pricing, availability and delivery windows are estimates and can change.",
  },
  {
    title: "Payments",
    body: "You authorise us to charge your chosen payment method for orders, fees and any applicable charges. Refunds are issued to the original payment method where applicable.",
  },
  {
    title: "Cancellations",
    body: "Deliveries and bookings can be cancelled from your account before the relevant cut-off; cancellation and refund eligibility depends on how far along the order is.",
  },
  {
    title: "Acceptable use",
    body: "Don't use Instanta for anything unlawful, to ship prohibited items, or to abuse riders, drivers or support staff. We may suspend accounts that violate these terms.",
  },
  {
    title: "Liability",
    body: "Instanta provides the service on an 'as is' basis. We work to keep tracking, pricing and availability accurate, but we aren't liable for delays or losses outside our reasonable control.",
  },
  {
    title: "Changes",
    body: "We may update these terms from time to time; continuing to use Instanta after a change means you accept the updated terms.",
  },
  {
    title: "Contact",
    body: "Questions about these terms can be sent through our contact page.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of service"
      lastUpdated="October 2026"
      intro="The terms that apply when you use Instanta for deliveries, bookings or a business account."
      sections={SECTIONS}
    />
  );
}
