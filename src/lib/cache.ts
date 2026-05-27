// ============================================================================
// Data Cache — Next.js unstable_cache wrappers for API responses
// Reduces database hits for frequently-read data.
// ============================================================================

import { unstable_cache } from "next/cache";

// ── Default TTLs ──────────────────────────────────────────────────────────
const CACHE_TTL = {
  SHORT: 30,      // 30 seconds — frequently-changing data
  MEDIUM: 300,    // 5 minutes — dashboard stats
  LONG: 3600,     // 1 hour — rarely-changing reference data
  DAY: 86400,     // 24 hours — static lookups
} as const;

// ── Cache tag helpers ─────────────────────────────────────────────────────
const TAGS = {
  PROPERTIES: "properties",
  TENANTS: "tenants",
  MAINTENANCE: "maintenance",
  AMENITIES: "amenities",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
  ACTIVITY: "activity",
  DASHBOARD: "dashboard",
} as const;

/**
 * Generic cached fetcher with revalidation tags.
 */
export function cached<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {}
): Promise<T> {
  const { ttl = CACHE_TTL.MEDIUM, tags = [] } = options;
  return unstable_cache(fetcher, key, {
    revalidate: ttl,
    tags,
  })();
}

/**
 * Invalidate specific cache tags (call after mutations).
 */
export function revalidateByTag(...tags: string[]) {
  const { revalidateTag } = require("next/cache");
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

// ── Export constants ──────────────────────────────────────────────────────
export { CACHE_TTL, TAGS };