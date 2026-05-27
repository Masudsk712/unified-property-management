// ============================================================================
// Rate Limiting — Simple in-memory rate limiter for API routes
// For production, use Redis or Upstash Rate Limit.
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  interval?: number; // in milliseconds (default: 60000 = 1 minute)
  maxRequests?: number; // max requests per interval (default: 5)
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetTime: number } {
  const { interval = 60_000, maxRequests = 5 } = options;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clear expired entries every 5 minutes to prevent memory leaks
  if (rateLimitMap.size > 1000) {
    const expiredKeys: string[] = [];
    rateLimitMap.forEach((v, k) => {
      if (now > v.resetTime) expiredKeys.push(k);
    });
    expiredKeys.forEach((k) => rateLimitMap.delete(k));
  }

  if (!record || now > record.resetTime) {
    // Start new window
    const resetTime = now + interval;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { success: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

/**
 * Get a rate limit key from the request (IP-based).
 * Uses X-Forwarded-For header or falls back to a default.
 */
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const pathname = new URL(request.url).pathname;
  return `${ip}:${pathname}`;
}