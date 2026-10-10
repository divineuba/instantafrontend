"use client";

import * as React from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 1.4,
  prefix = "",
  suffix = "",
  format,
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      // Syncing to the user's reduced-motion preference, an external
      // system, once the counter has entered the viewport.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  const text = format ? format(display) : display.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
