import Link from "next/link";

const FLOW_STEPS = ["Search", "Select", "Passengers", "Payment", "Confirmed"];

export function FlowBar({
  routeLabel,
  dateLabel,
  step,
}: {
  routeLabel: string;
  dateLabel: string;
  step: 0 | 1 | 2 | 3 | 4;
}) {
  return (
    <div className="border-b border-divider">
      <div className="ins-container flex items-center gap-6 py-3.5 flex-wrap">
        <span className="font-semibold text-lg flex items-center gap-1.5">
          {routeLabel}
        </span>
        <span className="text-[13px] text-neutral-700">{dateLabel}</span>
        <Link href="/travels" className="text-[13px] text-accent-700 no-underline hover:underline">
          Change search
        </Link>
        <div className="flex gap-1 items-center ml-auto">
          {FLOW_STEPS.map((label, i) => (
            <span
              key={label}
              className={`flex items-center gap-1.5 text-[13px] px-2 py-1 border-b-2 ${
                i === step ? "border-accent" : "border-transparent"
              } ${i <= step ? "text-text" : "text-neutral-500"}`}
            >
              <span className="font-semibold">{i + 1}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
