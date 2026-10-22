"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function FadeInWhenVisible({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  // The server cannot know the reduced-motion preference, so the initial
  // state must be the same on both sides. Skipping `initial` on the client
  // left the server's opacity:0 in place after hydration and hid the content
  // for reduced-motion users. Instead, keep `initial` and reveal instantly.
  if (reduceMotion) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
