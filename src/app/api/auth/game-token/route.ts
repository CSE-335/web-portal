import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const secret = process.env.GAME_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Token secret not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();

  // Check for authenticated user
  let userId: string | null = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(secret));

  cookieStore.set("game-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
    maxAge: 900,
  });

  return NextResponse.json({ ok: true });
}
