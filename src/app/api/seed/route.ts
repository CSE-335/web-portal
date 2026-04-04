import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { games } from "@/data/games";
import type { Database } from "@/lib/supabase/database.types";

// Call to add games to database.

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for seed route.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const mappedGames = games.map((game) => ({
    slug: game.slug,
    title: game.title,
    subject: game.subject,
    description: game.description,
    long_description: game.longDescription,
    link: game.iframeSrc,
    thumbnail: game.thumbnailSrc,
    metadata: {},
  }));

  const { error: deleteError } = await supabase
    .from("games")
    .delete()
    .not("id", "is", null);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { data, error } = await supabase.from("games").insert(mappedGames).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data });
}
