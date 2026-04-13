import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const secret = new TextEncoder().encode(process.env.GAME_TOKEN_SECRET);

// Logged-in users: 50 requests per 15 minutes
const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "15m"),
  prefix: "ratelimit:auth",
});

// Anonymous users: 10 requests per 15 minutes
const anonRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15m"),
  prefix: "ratelimit:anon",
});

export async function middleware(request: NextRequest) {
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

  // Rate limit based on user ID (logged in) or IP (anonymous)
  const limiter = payload.userId ? authRatelimit : anonRatelimit;
  const key = payload.userId ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = await limiter.limit(key);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());

  return response;
}

export const config = {
  matcher: ["/api/ai/:path*", "/api/assistant/:path*"],
};
