export { supabase } from "./client";
export { createServerSupabaseClient } from "./server";
export {
  signUpNewUser,
  
  signInUser,
  signOutUser,
  signInWithGoogle,

} from "./auth";
export type { Email, Password, SignUpOptions, SignUpResult } from "./auth";
export { createUserProfile } from "./user-profile";
export type { Database } from "./database.types";
