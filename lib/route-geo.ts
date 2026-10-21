import type { DeliveryStatusKey } from "@/lib/logistics";

export type RouteStage = "picked" | "transit" | "out" | "delivered";

export const STAGE_ORDER: readonly RouteStage[] = ["picked", "transit", "out", "delivered"];

/** Mirrors the backend's status→stage mapping so a socket-pushed status
 * (which only carries the raw enum) can be folded into the UI's stage model
 * without a full refetch. */
export const STATUS_TO_STAGE: Record<DeliveryStatusKey, RouteStage | "notfound"> = {
  PENDING: "picked",
  PICKED_UP: "picked",
  IN_TRANSIT: "transit",
  OUT_FOR_DELIVERY: "out",
  DELIVERED: "delivered",
  CANCELLED: "notfound",
};

/** 0 (just picked up) to 1 (delivered) for a stage along the stepper. */
export function progressForStage(stage: RouteStage | "notfound"): number {
  const idx = STAGE_ORDER.indexOf(stage as RouteStage);
  return Math.max(idx, 0) / (STAGE_ORDER.length - 1);
}

/** Walks a real route polyline (GeoJSON [lng, lat] pairs) by `progress`
 * (0 = just picked up, 1 = delivered) to place a position marker. The route
 * itself is real road geometry from the backend's Mapbox seam — only the
 * position *along* it is simulated from delivery status, which is why
 * callers show this as "estimated position," never "live GPS". */
export function pointAtProgress(points: [number, number][], t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  const segLens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = segLens.reduce((a, b) => a + b, 0);
  let target = total * clamped;
  for (let i = 0; i < segLens.length; i++) {
    const len = segLens[i];
    if (target <= len || i === segLens.length - 1) {
      const frac = len === 0 ? 0 : Math.min(target / len, 1);
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      return { x: x1 + (x2 - x1) * frac, y: y1 + (y2 - y1) * frac, segmentIndex: i };
    }
    target -= len;
  }
  const [x, y] = points[points.length - 1];
  return { x, y, segmentIndex: points.length - 2 };
}
