"use client";

import * as React from "react";
import MapGL, { Marker, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Icon } from "@/components/ui/icon";
import type { AdminDeliveryRow } from "@/lib/admin";
import type { DeliveryStatusKey } from "@/lib/logistics";
import { STATUS_TO_STAGE, progressForStage, pointAtProgress } from "@/lib/route-geo";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const STATUS_COLORS: Record<DeliveryStatusKey, string> = {
  PENDING: "#94a3b8",
  PICKED_UP: "#3b82f6",
  IN_TRANSIT: "#2f6fed",
  OUT_FOR_DELIVERY: "#f59e0b",
  DELIVERED: "#28a745",
  CANCELLED: "#94a3b8",
};

interface Plotted {
  delivery: AdminDeliveryRow;
  status: DeliveryStatusKey;
  lng: number;
  lat: number;
}

/** Plots every active delivery as a status-colored pin. Position comes from
 * walking the real route polyline to the point its status implies — the
 * same "estimated position, never live GPS" approach as the tracking page —
 * falling back to the pickup point when no route geometry exists yet, and
 * skipping a delivery entirely rather than fabricating a position when
 * neither is available (e.g. geocoding never ran for it). */
export function OpsMap({
  deliveries,
  liveStatus,
  onSelect,
}: {
  deliveries: AdminDeliveryRow[];
  liveStatus: Record<string, DeliveryStatusKey>;
  onSelect?: (d: AdminDeliveryRow) => void;
}) {
  const mapRef = React.useRef<MapRef>(null);

  const plotted: Plotted[] = React.useMemo(() => {
    const out: Plotted[] = [];
    for (const d of deliveries) {
      const status = liveStatus[d.id] ?? d.rawStatus;
      const stage = STATUS_TO_STAGE[status];
      if (d.routePolyline && d.routePolyline.length > 1) {
        const pos = pointAtProgress(d.routePolyline, progressForStage(stage));
        out.push({ delivery: d, status, lng: pos.x, lat: pos.y });
      } else if (d.pickupLat != null && d.pickupLng != null) {
        out.push({ delivery: d, status, lng: d.pickupLng, lat: d.pickupLat });
      }
    }
    return out;
  }, [deliveries, liveStatus]);

  const bounds = React.useMemo(() => {
    if (plotted.length === 0) return null;
    const lngs = plotted.map((p) => p.lng);
    const lats = plotted.map((p) => p.lat);
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ] as [[number, number], [number, number]];
  }, [plotted]);

  if (!MAPBOX_TOKEN || plotted.length === 0) {
    return (
      <div className="relative rounded-xl border border-divider overflow-hidden h-[340px] flex flex-col items-center justify-center gap-2 text-center p-8 bg-neutral-100">
        <Icon name="pin" size={28} className="text-neutral-500" />
        <p className="text-sm text-neutral-700 m-0 max-w-sm">
          {MAPBOX_TOKEN
            ? "No deliveries with known coordinates yet."
            : "Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN isn't configured."}
        </p>
      </div>
    );
  }

  const center = plotted[0];

  return (
    <div className="relative rounded-xl border border-divider overflow-hidden h-[340px]">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 11 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        onLoad={() => {
          if (bounds) mapRef.current?.fitBounds(bounds, { padding: 50, duration: 0 });
        }}
      >
        <NavigationControl position="top-right" />
        {plotted.map((p) => (
          <Marker key={p.delivery.id} longitude={p.lng} latitude={p.lat} anchor="center">
            <button
              type="button"
              title={`${p.delivery.id} · ${p.delivery.cust}`}
              onClick={() => onSelect?.(p.delivery)}
              className="size-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white cursor-pointer"
              style={{ background: STATUS_COLORS[p.status] }}
            >
              <Icon name="truck" size={13} />
            </button>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
