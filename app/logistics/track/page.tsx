"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MapGL, { Marker, Source, Layer, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  trackDelivery,
  listDeliveryMessages,
  type Delivery,
  type DeliveryMessage,
  type DeliveryStatusKey,
  SPEEDS,
  WEIGHT_BANDS,
} from "@/lib/logistics";
import { connectTrackingSocket, type DeliveryUpdateEvent, type ChatNewEvent } from "@/lib/logistics-socket";
import { ApiError } from "@/lib/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const STAGE_DEFS: { key: "picked" | "transit" | "out" | "delivered"; label: string; icon: IconName }[] = [
  { key: "picked", label: "Picked up", icon: "package" },
  { key: "transit", label: "In transit", icon: "route" },
  { key: "out", label: "Out for delivery", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "check" },
];

const STAGE_ORDER = ["picked", "transit", "out", "delivered"] as const;

/** Mirrors the backend's status→trackState mapping so a socket-pushed status
 * (which only carries the raw enum) can be folded into the UI's stage model
 * without a full refetch. */
const STATUS_TO_TRACK_STATE: Record<DeliveryStatusKey, Delivery["trackState"]> = {
  PENDING: "picked",
  PICKED_UP: "picked",
  IN_TRANSIT: "transit",
  OUT_FOR_DELIVERY: "out",
  DELIVERED: "delivered",
  CANCELLED: "notfound",
};

/** Walks a real route polyline (GeoJSON [lng, lat] pairs) by `progress`
 * (0 = just picked up, 1 = delivered) to place the rider marker. The route
 * itself is real road geometry from the backend's Mapbox seam — only the
 * position *along* it is simulated from delivery status, which is why the
 * UI calls this "estimated position," never "live GPS". */
function pointAtProgress(points: [number, number][], t: number) {
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

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDistanceLabel(weightBand?: string) {
  const band = WEIGHT_BANDS.find((b) => b.key === weightBand);
  return band?.label ?? "Up to 5 kg";
}

function RouteMap({ delivery }: { delivery: Delivery }) {
  const mapRef = React.useRef<MapRef>(null);
  const polyline = delivery.routePolyline;
  const idx = STAGE_ORDER.indexOf(delivery.trackState as (typeof STAGE_ORDER)[number]);
  const delivered = delivery.trackState === "delivered";
  const progress = delivered ? 1 : Math.max(idx, 0) / (STAGE_ORDER.length - 1);

  const current = polyline && polyline.length > 1 ? pointAtProgress(polyline, progress) : null;
  const donePoints: [number, number][] =
    polyline && current ? [...polyline.slice(0, current.segmentIndex + 1), [current.x, current.y]] : [];
  const remainingPoints: [number, number][] =
    polyline && current ? [[current.x, current.y], ...polyline.slice(current.segmentIndex + 1)] : [];

  const bounds = React.useMemo(() => {
    if (!polyline || polyline.length === 0) return null;
    const lngs = polyline.map((p) => p[0]);
    const lats = polyline.map((p) => p[1]);
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ] as [[number, number], [number, number]];
  }, [polyline]);

  if (!MAPBOX_TOKEN || !polyline || polyline.length < 2) {
    return (
      <div className="relative rounded-xl border border-divider overflow-hidden h-[420px] sm:h-[520px] flex flex-col items-center justify-center gap-2 text-center p-8 bg-neutral-100">
        <Icon name="pin" size={28} className="text-neutral-500" />
        <p className="text-sm text-neutral-700 m-0 max-w-sm">
          {MAPBOX_TOKEN
            ? "No route map yet for this delivery."
            : "Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN isn't configured."}
        </p>
      </div>
    );
  }

  const pickup = polyline[0];
  const destination = polyline[polyline.length - 1];

  return (
    <div className="relative rounded-xl border border-divider overflow-hidden h-[420px] sm:h-[520px]">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: (pickup[0] + destination[0]) / 2,
          latitude: (pickup[1] + destination[1]) / 2,
          zoom: 12,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        onLoad={() => {
          if (bounds) mapRef.current?.fitBounds(bounds, { padding: 60, duration: 0 });
        }}
      >
        <NavigationControl position="top-right" />
        {donePoints.length > 1 && (
          <Source
            id="route-done"
            type="geojson"
            data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: donePoints } }}
          >
            <Layer id="route-done-line" type="line" paint={{ "line-color": "#2f6fed", "line-width": 4 }} />
          </Source>
        )}
        {remainingPoints.length > 1 && (
          <Source
            id="route-remaining"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: remainingPoints },
            }}
          >
            <Layer
              id="route-remaining-line"
              type="line"
              paint={{ "line-color": "#2f6fed", "line-width": 3, "line-dasharray": [2, 2] }}
            />
          </Source>
        )}
        <Marker longitude={pickup[0]} latitude={pickup[1]} anchor="bottom">
          <div className="size-[18px] rounded-full border-2 border-accent-800 bg-white" />
        </Marker>
        <Marker longitude={destination[0]} latitude={destination[1]} anchor="bottom">
          <div
            className={`size-5 text-white rounded-[10px] flex items-center justify-center ${
              delivered ? "bg-[#28a745]" : "bg-accent-800"
            }`}
          >
            <Icon name={delivered ? "check" : "pin"} size={12} />
          </div>
        </Marker>
        {!delivered && current && (
          <Marker longitude={current.x} latitude={current.y} anchor="center">
            <div className="size-6 rounded-full bg-accent flex items-center justify-center text-white shadow-md">
              <Icon name="truck" size={14} />
            </div>
          </Marker>
        )}
      </MapGL>
      <div className="absolute left-5 top-5 bg-[var(--color-bg)] border border-divider px-3.5 py-2.5 flex gap-2.5 items-center text-[13px] rounded-xl">
        <span className={`size-2 rounded-full ${delivered ? "bg-neutral-400" : "bg-[#28a745]"}`} />
        {delivered ? "Delivered" : "Estimated position · updates as status changes"}
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  live,
  phoneInput,
  onPhoneInputChange,
  onUnlock,
  chatInput,
  onChatInputChange,
  onSend,
}: {
  messages: DeliveryMessage[];
  live: boolean;
  phoneInput: string;
  onPhoneInputChange: (v: string) => void;
  onUnlock: () => void;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="p-5 rounded-xl border border-divider bg-card flex flex-col gap-3">
      <div className="text-xl font-semibold">Support chat</div>
      {!live && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-accent-100/40 text-[13px]">
          <span>Enter the phone number used to book this delivery to unlock live chat and updates.</span>
          <div className="flex gap-2">
            <Input
              value={phoneInput}
              onChange={(e) => onPhoneInputChange(e.target.value)}
              placeholder="Phone number"
              className="h-9"
            />
            <Button variant="secondary" className="h-9 shrink-0" onClick={onUnlock}>
              Unlock
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 max-h-64 overflow-auto">
        {messages.length === 0 && <p className="text-sm text-neutral-600 m-0">No messages yet.</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
              m.sender === "CUSTOMER" ? "self-end bg-accent text-white" : "self-start bg-neutral-100"
            }`}
          >
            <div className="text-[11px] opacity-70 mb-0.5">{m.senderName}</div>
            {m.body}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex gap-2"
      >
        <Input
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder={live ? "Message support…" : "Unlock chat above to send a message"}
          disabled={!live}
          className="h-9"
        />
        <Button type="submit" className="h-9 shrink-0" disabled={!live || !chatInput.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

function TrackResult({
  delivery,
  live,
  messages,
  phoneInput,
  onPhoneInputChange,
  onUnlock,
  chatInput,
  onChatInputChange,
  onSendChat,
}: {
  delivery: Delivery;
  live: boolean;
  messages: DeliveryMessage[];
  phoneInput: string;
  onPhoneInputChange: (v: string) => void;
  onUnlock: () => void;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
}) {
  const idx = STAGE_ORDER.indexOf(delivery.trackState as (typeof STAGE_ORDER)[number]);
  const speed = SPEEDS.find((s) => s.key === delivery.speed);
  const chatRef = React.useRef<HTMLDivElement>(null);

  const timeline = [
    delivery.trackState === "delivered" && {
      time: formatTime(delivery.eta),
      title: "Delivered",
      sub: `Confirmed with PIN by ${delivery.destinationContact}`,
    },
    idx >= 2 && {
      time: formatTime(delivery.eta),
      title: "Out for delivery",
      sub: `${delivery.riderName} is heading to the destination`,
    },
    idx >= 1 && {
      time: formatTime(delivery.createdAt),
      title: "In transit",
      sub: "Left the pickup hub",
    },
    idx >= 0 && {
      time: formatTime(delivery.createdAt),
      title: "Picked up",
      sub: `Signed by ${delivery.pickupContact}`,
    },
    {
      time: formatTime(delivery.createdAt),
      title: "Rider assigned",
      sub: `${delivery.riderName} · motorbike`,
    },
    {
      time: formatTime(delivery.createdAt),
      title: "Booked",
      sub: `${speed?.name ?? delivery.speed} · $${delivery.total}`,
    },
  ].filter(Boolean) as { time: string; title: string; sub: string }[];

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-divider mb-6 grid grid-cols-2 sm:grid-cols-4">
        {STAGE_DEFS.map((s, i) => {
          const done = i < idx || delivery.trackState === "delivered";
          const current = i === idx && delivery.trackState !== "delivered";
          return (
            <div
              key={s.key}
              className={`p-5 flex flex-col gap-2.5 border-r border-divider last:border-r-0 ${
                current ? "bg-accent-100/40" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`size-[26px] rounded-xl flex items-center justify-center border ${
                    done
                      ? "bg-accent border-accent text-white"
                      : current
                        ? "bg-white border-accent text-accent"
                        : "bg-transparent border-divider text-neutral-500"
                  }`}
                >
                  <Icon name={s.icon} size={14} />
                </span>
                <span className={`text-xl font-semibold ${i <= idx ? "text-text" : "text-neutral-500"}`}>
                  {s.label}
                </span>
              </div>
              <span className="text-[13px] text-neutral-700">
                {i === idx && delivery.trackState !== "delivered"
                  ? `Est. ${formatTime(delivery.eta)}`
                  : i <= idx
                    ? formatTime(delivery.eta)
                    : "—"}
              </span>
              <span className={`h-[3px] ${done ? "bg-accent" : "bg-neutral-300"}`} />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
        <RouteMap delivery={delivery} />

        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-xl border border-divider bg-card flex flex-col gap-1">
            <span className="text-xs text-neutral-600">
              {delivery.trackState === "delivered" ? "Delivered at" : "Estimated arrival"}
            </span>
            <span className="text-[48px] sm:text-[64px] font-semibold leading-none text-accent-700">
              {formatTime(delivery.eta)}
            </span>
            <span className="text-sm text-neutral-700">{delivery.destinationAddress}</span>
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card flex gap-3.5 items-center">
            <span className="size-12 rounded-[10px] bg-accent-200 text-accent-800 flex items-center justify-center text-xl font-semibold">
              {delivery.riderName
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2) ?? "—"}
            </span>
            <div className="mr-auto">
              <div className="text-xl font-semibold">{delivery.riderName}</div>
              <div className="text-[13px] text-neutral-700">Motorbike · {delivery.riderPhone}</div>
            </div>
            <Button variant="secondary" size="icon" aria-label="Call rider">
              <Icon name="phone" size={16} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Message rider"
              onClick={() => chatRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <Icon name="chat" size={16} />
            </Button>
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card">
            <div className="text-xl font-semibold mb-3">Timeline</div>
            <div className="flex flex-col">
              {timeline.map((t, i) => (
                <div key={i} className="grid grid-cols-[52px_14px_minmax(0,1fr)] gap-2.5 text-[13px]">
                  <span className="text-neutral-600">{t.time}</span>
                  <span className="flex flex-col items-center">
                    <span
                      className={`size-[9px] mt-1 border border-accent ${i === 0 ? "bg-accent" : "bg-transparent"}`}
                    />
                    {i < timeline.length - 1 && <span className="flex-1 w-px bg-divider min-h-[22px]" />}
                  </span>
                  <div className="pb-3">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-neutral-700">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={chatRef}>
            <ChatPanel
              messages={messages}
              live={live}
              phoneInput={phoneInput}
              onPhoneInputChange={onPhoneInputChange}
              onUnlock={onUnlock}
              chatInput={chatInput}
              onChatInputChange={onChatInputChange}
              onSend={onSendChat}
            />
          </div>

          <div className="p-5 rounded-xl border border-divider bg-card grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <div className="text-neutral-600">Package</div>
              <div>
                {delivery.package?.description} · {formatDistanceLabel(delivery.package?.weightBand)}
              </div>
            </div>
            <div>
              <div className="text-neutral-600">Option</div>
              <div>{speed?.name ?? delivery.speed}</div>
            </div>
            <div>
              <div className="text-neutral-600">Recipient</div>
              <div>{delivery.destinationContact}</div>
            </div>
            <div>
              <div className="text-neutral-600">Tracking ID</div>
              <div>{delivery.trackingId}</div>
            </div>
            <LinkButton href="/support" variant="secondary" className="col-span-2">
              <Icon name="help" size={14} /> Get help with this delivery
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}

function TrackNotFound({
  id,
  error,
  onRetry,
}: {
  id: string;
  error?: boolean;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <div className="p-16 rounded-xl border border-divider flex flex-col items-center gap-3.5 text-center">
        <Icon name="alert" size={32} className="text-error" />
        <div className="text-2xl font-semibold">Something went wrong</div>
        <p className="text-[15px] text-neutral-700 max-w-md m-0">
          We couldn&apos;t reach the tracking service. Check your connection and try again.
        </p>
        <div className="flex gap-2.5">
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
          <LinkButton href="/support" variant="ghost">
            Contact support
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-16 rounded-xl border border-divider flex flex-col items-center gap-3.5 text-center">
      <Icon name="search" size={32} className="text-neutral-600" />
      <div className="text-2xl font-semibold">
        {id ? `We couldn't find ${id}` : "Enter a tracking ID to begin"}
      </div>
      <p className="text-[15px] text-neutral-700 max-w-md m-0">
        Check the ID in your SMS or email. Tracking IDs start with INS- followed
        by letters and numbers.
      </p>
      <div className="flex gap-2.5">
        <LinkButton href="/account/trips" variant="secondary">
          See my deliveries
        </LinkButton>
        <LinkButton href="/support" variant="ghost">
          Contact support
        </LinkButton>
      </div>
    </div>
  );
}

function TrackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") ?? "";

  const [inputId, setInputId] = React.useState(initialId);
  const [delivery, setDelivery] = React.useState<Delivery | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [searchedId, setSearchedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  const [phone, setPhone] = React.useState("");
  const [phoneInput, setPhoneInput] = React.useState("");
  const [live, setLive] = React.useState(false);
  const [messages, setMessages] = React.useState<DeliveryMessage[]>([]);
  const [chatInput, setChatInput] = React.useState("");
  const socketRef = React.useRef<ReturnType<typeof connectTrackingSocket> | null>(null);

  const lookup = React.useCallback(async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchedId(id);
    setError(false);
    try {
      const d = await trackDelivery(id.trim());
      setDelivery(d);
    } catch (err) {
      setDelivery(null);
      setError(!(err instanceof ApiError && err.status === 404));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Triggering the initial lookup from a ?id= query param on mount is a
    // genuine sync-with-external-system (URL) effect, not derivable
    // render-time state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!delivery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      return;
    }
    listDeliveryMessages(delivery.trackingId)
      .then(setMessages)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.trackingId]);

  React.useEffect(() => {
    if (!delivery) return;
    const trackingId = delivery.trackingId;
    const socket = connectTrackingSocket(trackingId, phone || undefined);
    socketRef.current = socket;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(false);
    socket.on("connect", () => setLive(true));
    socket.on("connect_error", () => setLive(false));
    socket.on("disconnect", () => setLive(false));
    socket.on("delivery:update", (evt: DeliveryUpdateEvent) => {
      if (evt.trackingId !== trackingId) return;
      setDelivery((d) => (d ? { ...d, status: evt.status, trackState: STATUS_TO_TRACK_STATE[evt.status] } : d));
    });
    socket.on("chat:new", (evt: ChatNewEvent) => {
      if (evt.trackingId !== trackingId) return;
      setMessages((m) => [...m, evt.message]);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.trackingId, phone]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.replace(`/logistics/track?id=${encodeURIComponent(inputId)}`);
    lookup(inputId);
  }

  function sendChat() {
    const body = chatInput.trim();
    if (!body || !socketRef.current || !delivery) return;
    socketRef.current.emit("chat:send", { trackingId: delivery.trackingId, body });
    setChatInput("");
  }

  const headline = delivery
    ? {
        picked: "Picked up",
        transit: "In transit",
        out: "Out for delivery",
        delivered: "Delivered",
        notfound: "No match",
      }[delivery.trackState]
    : "Track a delivery";

  return (
    <main className="flex-1 ins-container pt-14 pb-24">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-6 mb-7"
      >
        <div className="mr-auto">
          <div className="text-[11px] tracking-[.14em] uppercase text-accent-700 font-semibold mb-2">
            Track a delivery
          </div>
          <h1 className="text-[clamp(32px,4.4vw,56px)] leading-[1.05]">{headline}</h1>
        </div>
        <Field label="Tracking ID" className="w-full sm:w-[260px] lg:w-[300px]">
          <Input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="INS-23892"
          />
        </Field>
        <Button type="submit" className="h-10" disabled={loading}>
          {loading ? "Tracking…" : "Track"}
        </Button>
      </form>

      {searchedId && !loading && delivery && (
        <TrackResult
          delivery={delivery}
          live={live}
          messages={messages}
          phoneInput={phoneInput}
          onPhoneInputChange={setPhoneInput}
          onUnlock={() => setPhone(phoneInput.trim())}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendChat={sendChat}
        />
      )}
      {searchedId && !loading && !delivery && (
        <TrackNotFound id={searchedId} error={error} onRetry={() => lookup(searchedId)} />
      )}
      {!searchedId && !loading && <TrackNotFound id="" />}
    </main>
  );
}

export default function LogisticsTrackPage() {
  return (
    <>
      <Header business="logistics" active="track" />
      <React.Suspense fallback={<main className="flex-1 ins-container pt-14 pb-24" />}>
        <TrackPageInner />
      </React.Suspense>
      <Footer />
    </>
  );
}
