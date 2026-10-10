# Integration seams

One thing in this repo stands in for a real third-party integration, built as a swappable interface so wiring in the real provider later is a one-file change. See `backend/INTEGRATIONS.md` for the payment-gateway and transactional-email seams, which live in the backend repo.

## Geocoding / distance

**Where:** `lib/logistics.ts` — `DistanceProvider` interface, `HeuristicZoneDistanceProvider` implementation, `distanceProvider` export.

```ts
export interface DistanceProvider {
  resolveLabel(address: string): string | null;
  estimateKm(pickupAddress: string, destinationAddress: string): number;
}
```

There is no real geocoder. `HeuristicZoneDistanceProvider` matches free-text addresses against a fixed table of known Lagos-area neighbourhoods/cities (`KNOWN_AREAS`/`KNOWN_CITIES`) and estimates straight-line distance between their known lat/lng with the haversine formula; an address that doesn't match any known place falls back to a flat `FALLBACK_DISTANCE_KM`. This replaced the earlier hardcoded `MOCK_DISTANCE_KM` constant (same distance regardless of address) in Phase 8.5 — it's a transparent stand-in, not real geocoding, but at least reflects which addresses are near/far from each other.

Every frontend call site (`logistics/book`, the homepage quick-quote) goes through `distanceProvider.estimateKm()`/`resolveLabel()`, never the raw table directly. The computed `distanceKm` is then sent to the backend as part of the quote/booking DTO — `delivery.service.ts` trusts the client-supplied distance rather than recomputing it, so there is only one place (this file) that needs to change.

To wire in a real provider (Google Maps Distance Matrix, Mapbox, etc.):
1. Implement `DistanceProvider` against the real API (likely needs to become async — current interface is sync since the heuristic has no I/O; call sites will need a small update to `await` it).
2. Add the provider's API key as an env var.
3. Swap the `distanceProvider` export's implementation; keep the interface so callers don't change.
