import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@mantine/core";
import { createAnonymousSupabaseServerClient } from "@/lib/supabase";
import { createSessionClient, createAdminClient } from "@/lib/supabase/game-data";
import type { Database } from "@/lib/supabase/database.types";
import FriendProfileClient from "./FriendProfileClient";

type FriendProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export const metadata: Metadata = {
  title: "Player profile",
};

export default async function FriendProfilePage({ params }: FriendProfilePageProps) {
  const { userId } = await params;
  const t = await getTranslations("profilePage");
  const anonymousSupabase = createAnonymousSupabaseServerClient();
  const sessionResult = await createSessionClient();
  const sessionSupabase = sessionResult.ok ? sessionResult.supabase : null;
  const viewerId =
    sessionSupabase ? (await sessionSupabase.auth.getUser()).data.user?.id ?? null : null;

  const { data: profile } = await anonymousSupabase
    .from("user_profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle<UserProfileRow>();

  if (!profile) {
    notFound();
  }

  // Likes are filtered through RLS and only visible when viewer is allowed (self or friend via game_likes policy).
  const [{ data: likedRows }, friendshipsResult] = await Promise.all([
    sessionSupabase && viewerId
      ? sessionSupabase
          .from("game_likes")
          .select("game_slug, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
      : Promise.resolve({
        data: [] as { game_slug: string; created_at: string }[],
      }),
  ]);

  // Friends list for this profile uses the admin client to bypass friendship RLS
  // and show that user's full friend list.
  const adminResult = createAdminClient();
  let friendships: { requester_id: string; addressee_id: string; status: "accepted" }[] = [];
  if (adminResult.ok) {
    const { data } = await adminResult.supabase
      .from("friendships")
      .select("requester_id, addressee_id, status")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");
    friendships = (data ?? []) as typeof friendships;
  }

  const likedGames = likedRows ?? [];

  const otherIds = Array.from(
    new Set(
      (friendships ?? []).map((f) =>
        f.requester_id === userId ? f.addressee_id : f.requester_id
      )
    )
  );

  const { data: friendProfiles } = otherIds.length && sessionSupabase && viewerId
    ? await sessionSupabase
        .from("user_profiles")
        .select("auth_user_id, display_name, avatar_url")
        .in("auth_user_id", otherIds)
    : {
      data: [] as { auth_user_id: string; display_name: string | null; avatar_url: string | null }[],
    };

  const avatarUrl = profile.avatar_url || "/images/bobcat.png";
  const bannerUrl = profile.banner_url || null;
  const displayName = profile.display_name || "Player";
  const locationLabel = profile.locale?.trim() || t("locationUnknown");

  return (
    <Container size="xl" py={0} px={0}>
      <FriendProfileClient
        userId={userId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        bannerUrl={bannerUrl}
        locationLabel={locationLabel}
        likedGames={likedGames}
        friends={(friendProfiles ?? []).map((fp) => ({
          userId: fp.auth_user_id,
          displayName: fp.display_name ?? "Player",
          avatarUrl: fp.avatar_url ?? null,
        }))}
      />
    </Container>
  );
}

