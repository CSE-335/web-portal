-- ============================================================
-- LLNL STEM Games — Database Cleanup & Setup Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. DROP UNUSED TABLES ──
-- These were auto-created by the Supabase AI assistant and are not used.
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;

-- ── 2. FIX user_profiles TABLE ──
-- Add missing banner_url column (if not present)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- Add case-insensitive unique index on display_name for username uniqueness
-- (uses LOWER so "JohnDoe" and "johndoe" can't both exist)
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_display_name_unique
  ON public.user_profiles (LOWER(display_name))
  WHERE display_name IS NOT NULL;

-- Ensure RLS is enabled and policies exist
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;

-- Allow anyone to read profiles (for leaderboards, public pages)
CREATE POLICY "Anyone can view profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = auth_user_id);

-- ── 3. CREATE game_likes TABLE ──
CREATE TABLE IF NOT EXISTS public.game_likes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_slug)
);

ALTER TABLE public.game_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own likes" ON public.game_likes;
CREATE POLICY "Users can manage own likes"
  ON public.game_likes FOR ALL
  USING (auth.uid() = user_id);

-- ── 4. CREATE play_sessions TABLE ──
CREATE TABLE IF NOT EXISTS public.play_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_slug text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds int
);

ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own sessions" ON public.play_sessions;
CREATE POLICY "Users can manage own sessions"
  ON public.play_sessions FOR ALL
  USING (auth.uid() = user_id);

-- ── 5. FIX games TABLE ──
-- The games table already exists. Ensure it has the right columns.
-- Add subject column if missing (it exists from our audit)
-- Add link column if missing
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS long_description text[];
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS thumbnail text;

-- games should be publicly readable
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  USING (true);

-- ── 6. VERIFY ──
-- Run this to confirm everything is set up:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
