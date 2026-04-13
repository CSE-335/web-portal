import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let warnedMissingRateLimitEnv = false;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const ratelimitCache = new Map<string, Ratelimit>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown-ip";
  }

  return request.headers.get("x-real-ip") || "unknown-ip";
}

function getOrCreateRatelimit(prefix: string, limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`): Ratelimit | null {
  if (!redis) return null;

  const cacheKey = `${prefix}:${limit}:${window}`;
  const existing = ratelimitCache.get(cacheKey);
  if (existing) return existing;

  const created = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });
  ratelimitCache.set(cacheKey, created);
  return created;
}

export async function enforceRateLimit(options: {
  request: Request;
  prefix: string;
  limit: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
  identifierSuffix?: string;
}) {
  const { request, prefix, limit, window, identifierSuffix = "anonymous" } = options;
  const ratelimit = getOrCreateRatelimit(prefix, limit, window);
  if (!ratelimit) {
    if (!warnedMissingRateLimitEnv) {
      warnedMissingRateLimitEnv = true;
      console.warn(
        "[RateLimit] Upstash rate limiting is disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      );
    }
    return null;
  }

  const identifier = `${getClientIp(request)}:${identifierSuffix}`;
  const result = await ratelimit.limit(identifier);
  if (result.success) return null;

  const retryAfterSeconds = Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1);

  return {
    status: 429,
    body: { error: "Rate limit exceeded, try again later" },
    headers: {
      "Retry-After": retryAfterSeconds.toString(),
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
    },
  };
}
