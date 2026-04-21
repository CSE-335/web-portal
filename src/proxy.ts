import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const secret = new TextEncoder().encode(process.env.GAME_TOKEN_SECRET);
const redis = Redis.fromEnv();

type RateLimitConfig = {
  path: string;
  prefix: string;
  auth: number;
  anon: number;
  window: Parameters<typeof Ratelimit.slidingWindow>[1];
};

const defaultLimit: Omit<RateLimitConfig, "path" | "prefix"> = { auth: 50, anon: 10, window: "15m" };

const routeLimits: RateLimitConfig[] = [
  { path: "/api/ai/openai/whisper", prefix: "rl:whisper", auth: 20, anon: 5, window: "1m" },
  { path: "/api/assistant", prefix: "rl:assistant", auth: 30, anon: 10, window: "1m" },
  { path: "/api/tts", prefix: "rl:tts", auth: 10, anon: 5, window: "1m" },
];

// Cache rate limiter instances so they're created once
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(prefix: string, limit: number, window: RateLimitConfig["window"]): Ratelimit {
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

export async function proxy(request: NextRequest) {
  // Skip all checks in development (unless ENABLE_RATE_LIMIT is set for testing)
  if (process.env.NODE_ENV === "development" && !process.env.ENABLE_RATE_LIMIT) {
    return NextResponse.next();
  }

  // Read token from cookie
  const token = request.cookies.get("game-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Missing game token" }, { status: 403 });
  }

  // Verify JWT signature and expiry
  let payload: { userId?: string | null };
  try {
    const { payload: verified } = await jwtVerify(token, secret);
    payload = verified as { userId?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  // Match route-specific limits or fall back to default
  const matched = matchRouteLimit(request.nextUrl.pathname);
  const limit = payload.userId
    ? (matched?.auth ?? defaultLimit.auth)
    : (matched?.anon ?? defaultLimit.anon);
  const window = matched?.window ?? defaultLimit.window;
  const prefix = matched?.prefix ?? "rl:default";

  const limiter = getLimiter(prefix, limit, window);
  const key = payload.userId ?? request.headers.get("x-forwarded-for") ?? "unknown";
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
