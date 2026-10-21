# Integration seams

See `backend/INTEGRATIONS.md` for the payment-gateway, email, flight-search, object-storage, geocoding and FX-rate seams, which live in the backend repo.

## Map tiles — Mapbox GL

**Where:** `NEXT_PUBLIC_MAPBOX_TOKEN` env var, consumed by `mapbox-gl`/`react-map-gl` (`react-map-gl/mapbox` subpath) on the Logistics tracking page (`app/logistics/track/page.tsx`) to render the real route polyline, pickup/destination/rider markers, and tiles.

Same Mapbox account as the backend's `MAPBOX_ACCESS_TOKEN` (`backend/INTEGRATIONS.md`) — sign up free at https://account.mapbox.com and create a token scoped to this app's domain. The frontend token is a public, domain-restricted token (safe to ship to the browser); it is separate from the backend's secret token, which calls the Geocoding/Directions APIs server-side.

If the token is unset, the tracking page shows a "map unavailable" placeholder instead of rendering a blank/broken map — it never fabricates a route.

## Address autocomplete — Mapbox Geocoding API

**Where:** `lib/logistics.ts` — `suggestAddresses()`, consumed by `components/logistics/address-autocomplete.tsx` on the booking wizard's pickup/destination fields.

Calls Mapbox's Geocoding API directly from the browser with the same public `NEXT_PUBLIC_MAPBOX_TOKEN` above. This is a UI convenience only: the backend's `GeocodingProvider` (`backend/INTEGRATIONS.md`) re-geocodes whatever address string the user actually submits, so an unset token just means no suggestion dropdown — not a broken quote/booking flow. There is no client-side distance estimate anywhere in this app anymore; `quoteDelivery`/`createDelivery` send address strings and the backend returns the real `distanceKm`/`durationMin`/route.

## Realtime — Socket.IO

**Where:** `lib/logistics-socket.ts` — `connectTrackingSocket()`, consumed by the tracking page for live status updates (`delivery:update`) and support chat (`chat:send`/`chat:new`) over the backend's `/logistics` namespace. `lib/dating-socket.ts` — `getDatingSocket()`, the equivalent singleton for Love's `/dating` namespace.

Guests (no login) additionally pass the phone number used to book the delivery in the handshake `auth` payload — the backend's `TrackingGuard` checks it against the delivery's contact phone. Without a matching phone (or an owning login session), the socket connection is rejected and the tracking page falls back to the one-time REST lookup with no live updates or chat.

The admin Deliveries page (`app/admin/deliveries/page.tsx`, `components/admin/ops-map.tsx`) uses `connectAdminOpsSocket()` instead — no trackingId/phone in the handshake, since the backend auto-joins any cookie-authenticated admin to a global ops room that rebroadcasts every delivery's `delivery:update`/`chat:new` events. One connection feeds the live ops map's pin positions and the chat inbox across the whole fleet.
