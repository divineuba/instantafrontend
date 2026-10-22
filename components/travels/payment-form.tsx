"use client";

import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { fmtUsd, payBooking, type Booking, type PaymentMethodKey, type PaymentProviderKey } from "@/lib/travels";

const PAY_METHODS: { key: PaymentMethodKey; label: string; icon: IconName }[] = [
  { key: "CARD", label: "Card", icon: "card" },
  { key: "WALLET", label: "Instanta wallet", icon: "wallet" },
  { key: "BANK_TRANSFER", label: "Bank transfer", icon: "building" },
  { key: "BUSINESS", label: "Business account", icon: "briefcase" },
];

const CARD_PROVIDERS: { key: PaymentProviderKey; label: string }[] = [
  { key: "BACHS", label: "Bachs" },
  { key: "STRIPE", label: "Stripe" },
  { key: "FLUTTERWAVE", label: "Flutterwave" },
];

export function PaymentForm({ booking: initialBooking }: { booking: Booking }) {
  const [booking, setBooking] = React.useState(initialBooking);
  const [method, setMethod] = React.useState<PaymentMethodKey>("CARD");
  const [provider, setProvider] = React.useState<PaymentProviderKey>("BACHS");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lastPayment = booking.payments[booking.payments.length - 1];
  const showFailed = lastPayment?.status === "FAILED";

  async function handlePay() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await payBooking(booking.id, booking.accessKey, {
        method,
        provider: method === "CARD" ? provider : undefined,
      });
      setBooking(res.booking);
      if (method === "CARD") {
        // The customer finishes paying on the provider's own hosted page;
        // it redirects back to /travels/payment/return once done.
        if (res.payment.checkoutUrl) window.location.href = res.payment.checkoutUrl;
        else setError("Could not open the payment page. Please try again.");
        return;
      }
      window.location.href = `/travels/confirmed?booking=${encodeURIComponent(booking.id)}&key=${encodeURIComponent(booking.accessKey)}`;
    } catch {
      setError("Something went wrong starting this payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 min-w-0">
        <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0">Payment</h1>

        {(showFailed || error) && (
          <div className="flex gap-3 p-4.5 border border-error rounded-xl bg-[#fbe7e9]">
            <Icon name="alert" size={20} className="text-error shrink-0" />
            <div>
              <div className="font-medium">{error ? "Payment failed" : "This payment did not go through"}</div>
              <div className="text-[13px] text-neutral-800">
                {error ?? "No money was taken. Your fare is still held. Try another card or a different payment method."}
              </div>
            </div>
          </div>
        )}

        <div className="p-7 border border-divider rounded-xl bg-card flex flex-col gap-4.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAY_METHODS.map((m) => {
              const active = method === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`p-3.5 rounded-xl border text-sm flex flex-col items-start gap-1.5 cursor-pointer ${
                    active ? "border-accent bg-accent-100/40" : "border-divider bg-transparent"
                  }`}
                >
                  <Icon name={m.icon} size={18} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {method === "CARD" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {CARD_PROVIDERS.map((p) => {
                  const active = provider === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setProvider(p.key)}
                      className={`p-3 rounded-xl border text-sm font-medium cursor-pointer ${
                        active ? "border-accent bg-accent-100/40" : "border-divider bg-transparent"
                      }`}
                    >
                      {p.label}
                      {p.key === "BACHS" && (
                        <span className="block text-[11px] text-neutral-600 font-normal">Default</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-600 m-0">
                You&apos;ll be redirected to {CARD_PROVIDERS.find((p) => p.key === provider)?.label}&apos;s secure
                payment page to enter your card details, then brought back here automatically.
              </p>
            </>
          )}
          {method !== "CARD" && (
            <p className="text-sm text-neutral-700 m-0">
              {method === "WALLET" && "Your Instanta wallet balance will be charged."}
              {method === "BANK_TRANSFER" && "Transfer instructions will be sent to your email after you continue."}
              {method === "BUSINESS" && "This charge will be billed to your linked business account."}
            </p>
          )}
        </div>

        <p className="text-[13px] text-neutral-700 m-0 flex gap-2">
          <Icon name="lock" size={14} />
          Payments are encrypted. By paying you accept the fare rules and Instanta&apos;s terms.
        </p>
      </div>

      <aside className="p-6 border border-divider rounded-xl bg-card sticky top-6 flex flex-col gap-3">
        <span className="text-xl font-semibold">Booking summary</span>
        <div className="flex justify-between text-sm gap-3">
          <span className="text-neutral-700">Flight</span>
          <span className="text-right">
            {booking.offer.legs.map((l) => l.flightNo).join(" / ")} · {booking.offer.legs[0].originCode} ⇄ {booking.offer.legs[booking.offer.legs.length - 1].destinationCode}
          </span>
        </div>
        <div className="flex justify-between text-sm gap-3">
          <span className="text-neutral-700">Passenger{booking.passengers.length > 1 ? "s" : ""}</span>
          <span className="text-right">
            {booking.passengers.length} adult{booking.passengers.length > 1 ? "s" : ""} ·{" "}
            {booking.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(", ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-700">Base fare</span>
          <span>{fmtUsd(booking.baseFare)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-700">Taxes</span>
          <span>{fmtUsd(booking.taxes)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-700">Fees</span>
          <span>{fmtUsd(booking.fees)}</span>
        </div>
        <div className="flex justify-between items-end pt-3 border-t border-divider">
          <span className="text-sm">Total</span>
          <span className="text-[40px] font-semibold leading-none">{fmtUsd(booking.total)}</span>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={handlePay}
          className="h-[46px] text-base inline-flex items-center justify-center gap-[7px] whitespace-nowrap font-semibold rounded-[0.4rem] bg-accent hover:bg-accent-700 text-white border-0 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "Processing…" : showFailed ? `Try again · ${fmtUsd(booking.total)}` : `Pay & book flight · ${fmtUsd(booking.total)}`}
        </button>
      </aside>
    </>
  );
}
