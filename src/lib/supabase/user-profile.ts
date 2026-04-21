// User profiles — CRUD, username validation, profanity filter
// Table: user_profiles (auth_user_id, display_name, avatar_url, banner_url, bio, locale)
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabase } from "./client";

type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

const USERNAME_REGEX = /^[a-zA-Z0-9._]+$/;
const USERNAME_MIN = 6;
const USERNAME_MAX = 15;

// Blocked words — substring match
const BLOCKED_WORDS = [
  "fuck", "shit", "ass", "damn", "bitch", "dick", "cock", "pussy",
  "cunt", "whore", "slut", "fag", "nigger", "nigga", "retard",
  "rape", "molest", "pedo", "nazi", "hitler", "porn", "penis",
  "vagina", "anus", "sex", "cum", "jizz", "dildo", "boob", "tit",
  "nude", "naked", "kill", "murder", "terror", "bomb", "shoot",
  "drug", "meth", "heroin", "cocaine",
];

export function isUsernameAppropriate(username: string): boolean {
  const lower = username.toLowerCase();
  return !BLOCKED_WORDS.some((word) => lower.includes(word));
}

export type UsernameChecks = {
  hasMinLength: boolean;
  hasMaxLength: boolean;
  validChars: boolean;
  appropriate: boolean;
};

export function getUsernameChecks(username: string): UsernameChecks {
  return {
    hasMinLength: username.length >= USERNAME_MIN,
    hasMaxLength: username.length <= USERNAME_MAX,
    validChars: USERNAME_REGEX.test(username) || username.length === 0,
    appropriate: isUsernameAppropriate(username),
  };
}

export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (username.length > USERNAME_MAX) return `Username must be at most ${USERNAME_MAX} characters`;
  if (!USERNAME_REGEX.test(username)) return "Only letters, numbers, . and _ are allowed";
  if (username.startsWith(".") || username.startsWith("_")) return "Username cannot start with . or _";
  if (username.endsWith(".") || username.endsWith("_")) return "Username cannot end with . or _";
  if (/[._]{2}/.test(username)) return "Username cannot have consecutive . or _";
  if (!isUsernameAppropriate(username)) return "Username contains inappropriate language";
  return null;
}

export async function isUsernameTaken(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  let query = supabase
    .from("user_profiles")
    .select("auth_user_id")
    .ilike("display_name", username);

  if (excludeUserId) {
    query = query.neq("auth_user_id", excludeUserId);
  }

  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}

export async function createUserProfile(
  supabase: SupabaseClient<Database>,
  options: {
    userId?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } = {}
): Promise<{ success: boolean; error: string | null }> {
  let userId = options.userId;

  if (!userId) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: userError?.message ?? "Not authenticated" };
    }
    userId = user.id;
  }

  const profile: UserProfileInsert = {
    auth_user_id: userId,
    display_name: options.displayName ?? null,
    avatar_url: options.avatarUrl ?? null,
  };

  const { error } = await supabase.from("user_profiles").insert(profile);

  if (error) {
    if (error.code === "23505") {
      return { success: true, error: null };
    }
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function getUserProfile(
  userId: string
): Promise<UserProfileRow | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  return data as UserProfileRow | null;
}

export async function updateUserProfile(
  fields: {
    display_name?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    bio?: string | null;
    locale?: string | null;
  }
): Promise<{ success: boolean; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(fields)
    .eq("auth_user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (fields.display_name !== undefined || fields.avatar_url !== undefined) {
    await supabase.auth.updateUser({
      data: {
        ...(fields.display_name !== undefined && { display_name: fields.display_name }),
        ...(fields.avatar_url !== undefined && { avatar_url: fields.avatar_url }),
      },
    });
  }

  return { success: true, error: null };
}
