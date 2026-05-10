import type { User } from "@supabase/supabase-js";

/**
 * Profile image URL from OAuth user_metadata.
 * Google (and some others) expose `picture`; GitHub-style providers use `avatar_url`.
 */
export function oauthAvatarUrlFromUserMetadata(
  meta: User["user_metadata"] | null | undefined
): string | null {
  if (!meta || typeof meta !== "object") return null;
  const raw = meta.avatar_url ?? meta.picture;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function oauthAvatarUrlFromUser(user: Pick<User, "user_metadata"> | null | undefined): string | null {
  return oauthAvatarUrlFromUserMetadata(user?.user_metadata);
}
