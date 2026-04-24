import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const secretKey = process.env.GAME_TOKEN_SECRET ?? "";
const secret = new TextEncoder().encode(secretKey);

// Lazily construct the Redis client so a missing env var doesn't crash module init
// (which would 500 every request before we can return a structured error).
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  _redis = Redis.fromEnv();
  return _redis;
}

type RateLimitConfig = {
  path: string;
  prefix: string;
  auth: number;
  anon: number;
  window: Parameters<typeof Ratelimit.slidingWindow>[1];
};

const defaultLimit: Omit<RateLimitConfig, "path" | "prefix"> = { auth: 50, anon: 10, window: "15m" };

const routeLimits: RateLimitConfig[] = [
  { path: "/api/ai/openai/whisper", prefix: "rl:whisper", auth: 20, anon: 5, window: "1m"},
  { path: "/api/assistant", prefix: "rl:assistant", auth: 30, anon: 10, window: "1m" },
  { path: "/api/tts", prefix: "rl:tts", auth: 10, anon: 5, window: "1m" }
];

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(prefix: string, limit: number, window: RateLimitConfig["window"]): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${prefix}:${limit}:${window}`;
  const cached = limiterCache.get(key);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix,
  });
  limiterCache.set(key, limiter);
  return limiter;
}

function matchRouteLimit(pathname: string): RateLimitConfig | null {
  return routeLimits.find((r) => pathname.startsWith(r.path)) ?? null;
}

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development" && !process.env.ENABLE_RATE_LIMIT) {
    return NextResponse.next();
  }

  // In production we require GAME_TOKEN_SECRET to be configured. Fail closed
  // rather than silently letting all requests through if it's missing.
  if (!secretKey) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 503 },
    );
  }

  const allowMissingTokenInDev =
    process.env.NODE_ENV === "development" && process.env.ALLOW_MISSING_GAME_TOKEN === "1";

  const token = request.cookies.get("game-token")?.value;

  if (!token && !allowMissingTokenInDev) {
    return NextResponse.json({ error: "Missing game token" }, { status: 403 });
  }

  let payload: { userId?: string | null };
  if (!token && allowMissingTokenInDev) {
    payload = { userId: null };
  } else {
    try {
      const { payload: verified } = await jwtVerify(token!, secret);
      payload = verified as { userId?: string | null };
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }
  }

  const matched = matchRouteLimit(request.nextUrl.pathname);
  const limit = payload.userId
    ? (matched?.auth ?? defaultLimit.auth)
    : (matched?.anon ?? defaultLimit.anon);
  const window = matched?.window ?? defaultLimit.window;
  const prefix = matched?.prefix ?? "rl:default";

  const limiter = getLimiter(prefix, limit, window);

  // If Upstash is not configured we still want auth to be enforced, but we
  // can't impose a quota. Fail closed in production rather than silently
  // disabling rate limiting on these paid endpoints.
  if (!limiter) {
    return NextResponse.json(
      { error: "Server misconfiguration: rate limiter unavailable" },
      { status: 503 },
    );
  }

  // Use the first hop in X-Forwarded-For (the client), not the entire chain
  // which an attacker could spoof to get a fresh bucket per request.
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const key = payload.userId ?? clientIp;
  const { success, remaining } = await limiter.limit(key);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());

  return response;
}

export const config = {
  matcher: ["/api/ai/:path*", "/api/assistant/:path*", "/api/tts/:path*"],
};
