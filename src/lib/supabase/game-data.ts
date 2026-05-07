import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Database } from "./database.types";

export type SessionClient = SupabaseClient<Database>;
export type AdminClient = SupabaseClient<Database>;

export async function createSessionClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Missing Supabase environment variables." },
        { status: 500 }
      ),
    };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  return { ok: true as const, supabase };
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Treat empty string as configured for local scaffolding;
  // only fail when the variable is truly missing (undefined/null).
  if (supabaseUrl == null || serviceRoleKey == null) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      ),
    };
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { ok: true as const, supabase };
}

export async function getAuthenticatedUserId(
  sessionSupabase: SessionClient,
  request: NextRequest
) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

  const {
    data: { user },
    error,
  } = accessToken
    ? await sessionSupabase.auth.getUser(accessToken)
    : await sessionSupabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 }),
    };
  }

  return { ok: true as const, authUserId: user.id };
}

export async function getGameIdBySlug(adminSupabase: AdminClient, slug: string) {
  const { data: game, error } = await adminSupabase.from("games").select("id").eq("slug", slug).maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Failed to resolve game.", details: error.message },
        { status: 500 }
      ),
    };
  }

  if (!game) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: `Game "${slug}" not found.` }, { status: 404 }),
    };
  }

  return { ok: true as const, gameId: game.id };
}

export async function getProfileIdByAuthUserId(
  adminSupabase: AdminClient,
  authUserId: string
) {
  const { data: profile, error } = await adminSupabase
    .from("user_profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, error: "Failed to resolve user profile.", details: error.message },
        { status: 500 }
      ),
    };
  }

  return { ok: true as const, profileId: profile?.id ?? null };
}
