import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { games } from "@/data/games";

// Call to add games to database.

export async function GET() {
  const supabase = createServerSupabaseClient();

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

  const { error: deleteError } = await supabase.from("games").delete().neq("id", 0);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { data, error } = await supabase.from("games").insert(mappedGames).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: data });
}
