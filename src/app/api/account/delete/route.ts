// Account deletion — removes all user data then deletes auth user
// Requires admin client (service role) to delete auth users
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    const admin = getSupabaseAdmin();

    // Delete profile data then auth user
    await admin.from("play_sessions").delete().eq("user_id", user.id);
    await admin.from("game_likes").delete().eq("user_id", user.id);
    await admin.from("user_profiles").delete().eq("auth_user_id", user.id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
