// Auth helpers — sign up, sign in, sign out, password reset, Google OAuth
// Email update is handled via supabase.auth.updateUser() in AccountSettingsPopup
// Email change confirmation goes through /auth/callback with token_hash
import { supabase } from "./client";

export type Email = string;
export type Password = string;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password.",
  invalid_login_credentials: "Invalid email or password.",
  invalid_email: "Please enter a valid email address.",
  user_already_registered: "An account with this email already exists. Try signing in.",
  email_not_confirmed: "Please confirm your email before signing in.",
  weak_password: "Password is too weak. Use at least 6 characters.",
  signup_disabled: "Sign up is currently disabled.",
  validation_failed: "Invalid email or password.",
  password_missing_number: "Password doesn't have at least 1 number.",
  password_missing_letter: "Password doesn't have at least 1 letter.",
};
function getAuthErrorMessage(code: string | undefined, fallback: string): string {
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  const lower = fallback.toLowerCase();
  if (/\b(number|digit|numeric)\b/.test(lower)) return AUTH_ERROR_MESSAGES.password_missing_number;
  if (/\b(letter|alpha|character)\b/.test(lower)) return AUTH_ERROR_MESSAGES.password_missing_letter;
  return fallback;
}

// Sign up
export type SignUpOptions = {
  email: Email;
  password: Password;
  displayName?: string;
};

export type SignUpResult = {
  success: boolean;
  error: string | null;
  userId?: string;
};

export async function signUpNewUser(
  email: Email,
  password: Password,
  options?: { displayName?: string }
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: options?.displayName
      ? { data: { display_name: options.displayName } }
      : undefined,
  });

  if (error) {
    const message = getAuthErrorMessage(error.code, error.message);
    return { success: false, error: message, userId: undefined };
  }

  const userId = data.user?.id ?? undefined;
  return { success: true, error: null, userId };
}

// Sign in
export async function signInUser(
  email: Email,
  password: Password
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = getAuthErrorMessage(error.code, error.message);
    return { success: false, error: message };
  }
  return { success: true, error: null };
}

// Sign out
export async function signOutUser(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

// Password reset
export async function resetPassword(email: Email): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/profile`,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

// Google OAuth
export async function signInWithGoogle(
  redirectTo?: string
): Promise<{ error: string | null }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackPath = redirectTo ?? "/auth/callback";
  const callbackUrl = `${origin}${callbackPath}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });
  if (error) return { error: error.message };
  if (data?.url) window.location.href = data.url;
  return { error: null };
}

// Ensure profile exists for the current user (called on every sign-in)
// Uses display_name from auth metadata if available (set during email signup),
// otherwise generates a random username (Google OAuth users).
export async function ensureUserProfile(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!existing) {
    // Use the username from signup metadata if available, otherwise generate one
    let displayName = user.user_metadata?.display_name;
    if (!displayName) {
      const { generateUsername } = await import("@/lib/utils/generateUsername");
      displayName = generateUsername(user.id);
    }
    await supabase.from("user_profiles").insert({
      auth_user_id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    });
  }
}
