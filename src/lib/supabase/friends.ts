import { supabase } from "./client";

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  responded_at: string | null;
};

export type FriendPresence = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  currentGameSlug: string | null;
  lastSeen: string | null;
  friendshipId: string;
};

export type FriendRequestItem = {
  friendshipId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type FriendsDashboard = {
  friends: FriendPresence[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
};

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function sendFriendRequestByUsername(
  username: string
): Promise<{ success: boolean; error: string | null }> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { success: false, error: "Please enter a username." };
  }

  const requesterId = await getCurrentUserId();
  if (!requesterId) return { success: false, error: "Not authenticated." };

  const { data: match, error: matchError } = await supabase
    .from("user_profiles")
    .select("auth_user_id, display_name")
    .ilike("display_name", trimmed)
    .limit(1)
    .maybeSingle();

  if (matchError) return { success: false, error: matchError.message };
  if (!match?.auth_user_id) {
    return { success: false, error: "No user found with that username." };
  }
  if (match.auth_user_id === requesterId) {
    return { success: false, error: "You cannot add yourself." };
  }

  const otherId = match.auth_user_id;

  const insertPending = async () => {
    const { error } = await supabase.from("friendships").insert({
      requester_id: requesterId,
      addressee_id: otherId,
      status: "pending",
    });
    return error;
  };

  const insertError = await insertPending();

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" ||
      /duplicate key value violates unique constraint/i.test(insertError.message ?? "");

    if (isDuplicate) {
      // A friendship/request row already exists for this pair.
      // Try to delete any existing row between the two users (either direction),
      // then retry inserting the pending request once.
      const { error: del1 } = await supabase
        .from("friendships")
        .delete()
        .eq("requester_id", requesterId)
        .eq("addressee_id", otherId);

      const { error: del2 } = await supabase
        .from("friendships")
        .delete()
        .eq("requester_id", otherId)
        .eq("addressee_id", requesterId);

      if (del1 || del2) {
        return { success: false, error: del1?.message ?? del2?.message ?? insertError.message };
      }

      const retryError = await insertPending();
      if (!retryError) return { success: true, error: null };

      return { success: false, error: retryError.message };
    }

    return { success: false, error: insertError.message };
  }

  return { success: true, error: null };
}

export async function respondToFriendRequest(
  friendshipId: string,
  accept: boolean
): Promise<{ success: boolean; error: string | null }> {
  if (!friendshipId) return { success: false, error: "Missing friendship id." };

  if (accept) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", friendshipId)
      .eq("status", "pending");
    return { success: !error, error: error?.message ?? null };
  }

  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  return { success: !error, error: error?.message ?? null };
}

export async function removeFriend(
  friendshipId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  return { success: !error, error: error?.message ?? null };
}

export async function upsertUserPresence(options: {
  isOnline: boolean;
  currentGameSlug?: string | null;
}): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase.from("user_presence").upsert({
    user_id: userId,
    is_online: options.isOnline,
    current_game_slug: options.currentGameSlug ?? null,
    last_seen: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function getFriendsDashboard(): Promise<FriendsDashboard> {
  const userId = await getCurrentUserId();
  if (!userId) return { friends: [], incomingRequests: [], outgoingRequests: [] };

  const { data: rows, error } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !rows) {
    return { friends: [], incomingRequests: [], outgoingRequests: [] };
  }

  const friendships = rows as FriendshipRow[];
  const otherUserIds = Array.from(
    new Set(
      friendships.map((row) =>
        row.requester_id === userId ? row.addressee_id : row.requester_id
      )
    )
  );
  if (otherUserIds.length === 0) {
    return { friends: [], incomingRequests: [], outgoingRequests: [] };
  }

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("auth_user_id, display_name, avatar_url")
    .in("auth_user_id", otherUserIds);

  const { data: presences } = await supabase
    .from("user_presence")
    .select("user_id, is_online, current_game_slug, last_seen")
    .in("user_id", otherUserIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.auth_user_id,
      {
        displayName: p.display_name ?? "Unknown user",
        avatarUrl: p.avatar_url ?? null,
      },
    ])
  );
  const presenceMap = new Map((presences ?? []).map((p) => [p.user_id, p]));

  const friends: FriendPresence[] = [];
  const incomingRequests: FriendRequestItem[] = [];
  const outgoingRequests: FriendRequestItem[] = [];

  for (const row of friendships) {
    const otherId = row.requester_id === userId ? row.addressee_id : row.requester_id;
    const profile = profileMap.get(otherId);
    const presence = presenceMap.get(otherId);
    const displayName = profile?.displayName ?? "Unknown user";
    const avatarUrl = profile?.avatarUrl ?? null;

    if (row.status === "accepted") {
      friends.push({
        userId: otherId,
        displayName,
        avatarUrl,
        isOnline: Boolean(presence?.is_online),
        currentGameSlug: presence?.current_game_slug ?? null,
        lastSeen: presence?.last_seen ?? null,
        friendshipId: row.id,
      });
      continue;
    }

    if (row.status !== "pending") {
      // Ignore "blocked" or any other non-displayable state.
      continue;
    }

    if (row.requester_id === userId) {
      outgoingRequests.push({
        friendshipId: row.id,
        userId: otherId,
        displayName,
        avatarUrl,
        createdAt: row.created_at,
      });
    } else {
      incomingRequests.push({
        friendshipId: row.id,
        userId: otherId,
        displayName,
        avatarUrl,
        createdAt: row.created_at,
      });
    }
  }

  return { friends, incomingRequests, outgoingRequests };
}
