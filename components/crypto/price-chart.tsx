"use client";

import * as React from "react";
import { AreaSeries, ColorType, createChart, type IChartApi } from "lightweight-charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { getMarketChart, type MarketChartPoint } from "@/lib/crypto";

const RANGES: { value: string; label: string; days: number }[] = [
  { value: "1", label: "24h", days: 1 },
  { value: "7", label: "7d", days: 7 },
  { value: "30", label: "30d", days: 30 },
  { value: "90", label: "90d", days: 90 },
];

export function PriceChart({ assetSymbol }: { assetSymbol: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const [range, setRange] = React.useState("7");
  const [points, setPoints] = React.useState<MarketChartPoint[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!assetSymbol) return;
    let active = true;
    setPoints(null);
    setError(false);
    const days = RANGES.find((r) => r.value === range)?.days ?? 7;
    getMarketChart(assetSymbol, days)
      .then((p) => {
        if (active) setPoints(p);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [assetSymbol, range]);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b6b6b",
        fontSize: 12,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#eee" },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderVisible: false },
      crosshair: { horzLine: { visible: true }, vertLine: { visible: true } },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !points || points.length === 0) return;
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#2563eb",
      topColor: "rgba(37, 99, 235, 0.28)",
      bottomColor: "rgba(37, 99, 235, 0.02)",
      lineWidth: 2,
      priceLineVisible: false,
    });
    series.setData(
      points.map((p) => ({ time: Math.floor(p.t / 1000) as never, value: p.priceUsdCents / 100 })),
    );
    chart.timeScale().fitContent();
    return () => {
      chart.removeSeries(series);
    };
  }, [points]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-neutral-700">Price history</span>
        <Segmented
          name="chart-range"
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({ value: r.value, label: r.label }))}
        />
      </div>
      <div className="relative h-[220px] w-full">
        {!points && !error && <Skeleton className="absolute inset-0 rounded-lg" />}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-600">
            Couldn&apos;t load price history.
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
