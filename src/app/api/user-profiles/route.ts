import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// test select on user_profiles table.
export async function GET() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*");

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
        message: "Select failed – check table name, RLS, or env.",
      },
      { status: 400 }
    );
  }

  const count = data?.length ?? 0;
  return NextResponse.json({
    ok: true,
    message: count === 0 ? "Select ran successfully; user_profiles has no rows yet." : `Found ${count} row(s).`,
    data,
    count,
  });
}
