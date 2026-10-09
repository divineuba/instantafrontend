"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { fmtUsd, payBooking, type Booking, type PaymentMethodKey } from "@/lib/travels";

const PAY_METHODS: { key: PaymentMethodKey; label: string; icon: IconName }[] = [
  { key: "CARD", label: "Card", icon: "card" },
  { key: "WALLET", label: "Instanta wallet", icon: "wallet" },
  { key: "BANK_TRANSFER", label: "Bank transfer", icon: "building" },
  { key: "BUSINESS", label: "Business account", icon: "briefcase" },
];

export function PaymentForm({ booking: initialBooking }: { booking: Booking }) {
  const router = useRouter();
  const [booking, setBooking] = React.useState(initialBooking);
  const [method, setMethod] = React.useState<PaymentMethodKey>("CARD");
  const [cardNumber, setCardNumber] = React.useState("4821 4821 4821 0093");
  const [nameOnCard, setNameOnCard] = React.useState(
    `${booking.passengerFirstName} ${booking.passengerLastName}`,
  );
  const [expiry, setExpiry] = React.useState("08 / 28");
  const [cvv, setCvv] = React.useState("123");
  const [submitting, setSubmitting] = React.useState(false);
  const [declined, setDeclined] = React.useState(false);

  const lastPayment = booking.payments[booking.payments.length - 1];
  const showFailed = declined || lastPayment?.status === "FAILED";

  async function handlePay() {
    setSubmitting(true);
    try {
      const res = await payBooking(booking.id, {
        method,
        cardNumber: method === "CARD" ? cardNumber : undefined,
      });
      setBooking(res.booking);
      if (res.payment.status === "FAILED") {
        setDeclined(true);
        window.scrollTo(0, 0);
      } else {
        router.push(`/travels/confirmed?booking=${booking.id}`);
      }
    } catch {
      setDeclined(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 min-w-0">
        <h1 className="text-[clamp(32px,4.4vw,48px)] leading-[1.05] m-0">Payment</h1>

        {showFailed && (
          <div className="flex gap-3 p-4.5 border border-error rounded-xl bg-[#fbe7e9]">
            <Icon name="alert" size={20} className="text-error shrink-0" />
            <div>
              <div className="font-medium">Your bank declined this payment</div>
              <div className="text-[13px] text-neutral-800">
                No money was taken. Your fare is still held. Try another card or a different payment method.
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
              <Field label="Card number" required>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Name on card" required>
                  <Input value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} />
                </Field>
                <Field label="Expiry" required>
                  <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </Field>
                <Field label="CVV" required>
                  <Input value={cvv} onChange={(e) => setCvv(e.target.value)} type="password" />
                </Field>
              </div>
              <p className="text-xs text-neutral-600 m-0">
                Tip: a card ending in 0002 always declines, for testing the retry flow.
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
            {booking.offer.outboundFlightNo} / {booking.offer.returnFlightNo} · {booking.offer.originCode} ⇄ {booking.offer.destinationCode}
          </span>
        </div>
        <div className="flex justify-between text-sm gap-3">
          <span className="text-neutral-700">Passenger</span>
          <span className="text-right">1 adult · {booking.passengerFirstName} {booking.passengerLastName}</span>
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
