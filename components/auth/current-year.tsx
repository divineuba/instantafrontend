"use client";

import * as React from "react";

const FALLBACK_YEAR = 2026;

export function CurrentYear() {
  const [year, setYear] = React.useState(FALLBACK_YEAR);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
