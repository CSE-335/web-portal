// Central exports for all Supabase modules
export { supabase } from "./client";
export {
  createAnonymousSupabaseServerClient,
  createServerSupabaseClient,
} from "./server";
export {
  signUpNewUser,
  
  signInUser,
  signOutUser,
  signInWithGoogle,

} from "./auth";
export type { Email, Password, SignUpOptions, SignUpResult } from "./auth";
export { createUserProfile, getUserProfile, updateUserProfile, validateUsername, isUsernameTaken, getUsernameChecks, isUsernameAppropriate } from "./user-profile";
export type { UsernameChecks } from "./user-profile";
export {
  toggleGameLike,
  isGameLikedByUser,
  getUserLikedGames,
  getUserLikesCount,
} from "./game-likes";
export {
  recordPlaySession,
  endPlaySession,
  getPlayStreak,
  getRecentActivity,
} from "./play-sessions";
export type { Database } from "./database.types";
