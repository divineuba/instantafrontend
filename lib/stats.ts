import { apiFetch } from "@/lib/api";

export interface PublicStats {
  customersServed: number;
  successfulDeliveries: number;
  citiesServed: number;
}

export function getPublicStats() {
  return apiFetch<PublicStats>("/stats/public");
}
