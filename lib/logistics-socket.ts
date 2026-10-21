import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";
import type { DeliveryMessage, DeliveryStatusKey } from "@/lib/logistics";

export interface DeliveryUpdateEvent {
  trackingId: string;
  status: DeliveryStatusKey;
}

export interface ChatNewEvent {
  trackingId: string;
  message: DeliveryMessage;
}

/** Opens a fresh connection to the /logistics namespace for one tracking
 * session. A logged-in owner authenticates via the existing access_token
 * cookie alone; a guest additionally presents the delivery's trackingId and
 * the phone it was booked with, so each call needs its own connection
 * (handshake auth can't be swapped on a live socket) — callers must
 * disconnect() it, e.g. on unmount or when switching tracking IDs. */
export function connectTrackingSocket(trackingId: string, phone?: string): Socket {
  return io(`${API_BASE_URL}/logistics`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: { trackingId, phone },
  });
}

/** Opens a connection for an admin console session: no trackingId/phone in
 * the handshake, since the backend's gateway auto-joins any cookie-admin to
 * the global ops room, which rebroadcasts every delivery's `delivery:update`
 * and `chat:new` events — one connection covers the whole fleet. Callers
 * must disconnect() it on unmount. */
export function connectAdminOpsSocket(): Socket {
  return io(`${API_BASE_URL}/logistics`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
}
