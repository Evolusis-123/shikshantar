import type { RequestHandler } from "express";

type Bucket = { count: number; resetAt: number };

/**
 * Lightweight IP rate limiter (no extra dependency).
 * Suitable for V1 donation initiation protection.
 */
export function createIpRateLimiter(options: {
  windowMs: number;
  max: number;
  message: { error: string; code: string };
}): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const now = Date.now();
    const ip =
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0]?.trim()
        : "") ||
      req.ip ||
      "unknown";

    let bucket = buckets.get(ip);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(ip, bucket);
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      return res.status(429).json(options.message);
    }

    // Opportunistic cleanup
    if (buckets.size > 5000) {
      for (const [key, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(key);
      }
    }

    return next();
  };
}
