"use client";

import * as React from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { FadeInWhenVisible } from "@/components/motion/fade-in-when-visible";

interface ChecklistStep {
  key: string;
  icon: IconName;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
}

export function OnboardingChecklist({
  emailVerified,
  hasPaymentMethod,
}: {
  emailVerified: boolean;
  hasPaymentMethod: boolean;
}) {
  const [dismissed, setDismissed] = React.useState(false);

  const steps: ChecklistStep[] = [
    {
      key: "verify",
      icon: "mail",
      title: "Verify your email",
      description: "Confirm your address so we can reach you about deliveries and trips.",
      href: "/account/profile",
      cta: "Verify email",
      done: emailVerified,
    },
    {
      key: "payment",
      icon: "card",
      title: "Add a payment method",
      description: "Save a card so checkout only takes a couple of taps.",
      href: "/account/payments",
      cta: "Add card",
      done: hasPaymentMethod,
    },
    {
      key: "first-order",
      icon: "package",
      title: "Book your first delivery or trip",
      description: "Send a package across town or search flights to get going.",
      href: "/logistics/book",
      cta: "Get started",
      done: false,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  if (dismissed) return null;

  return (
    <FadeInWhenVisible>
      <div className="relative border border-divider rounded-xl bg-card p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss checklist"
          className="absolute right-4 top-4 bg-transparent border-0 p-1 cursor-pointer text-neutral-600 hover:text-text"
        >
          <Icon name="x" size={16} />
        </button>

        <div className="mb-4 pr-8">
          <h2 className="text-lg font-semibold m-0">Get set up on Instanta</h2>
          <p className="text-sm text-neutral-600 mt-1 m-0">
            {doneCount} of {steps.length} done &mdash; a few quick steps to get the most out of your account.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                step.done ? "border-divider bg-bg" : "border-divider bg-card"
              }`}
            >
              <span
                className={`size-8 grid place-items-center rounded-full shrink-0 ${
                  step.done ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                <Icon name={step.done ? "check" : step.icon} size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className={`block text-sm font-medium ${step.done ? "line-through text-neutral-500" : "text-text"}`}
                >
                  {step.title}
                </span>
                <span className="block text-xs text-neutral-600">{step.description}</span>
              </span>
              {!step.done && (
                <Link
                  href={step.href}
                  className="shrink-0 text-sm font-semibold text-accent-700 no-underline whitespace-nowrap"
                >
                  {step.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
