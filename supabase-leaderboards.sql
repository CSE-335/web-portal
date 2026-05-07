-- =============================================================================
-- HARDENED LEADERBOARD MIGRATION
-- =============================================================================
-- This migration creates/locks down the leaderboard_scores table, exposes a read-only
-- public view (with display names from profiles), and funnels all writes
-- through a validated SECURITY DEFINER function.
--
-- Prerequisites:
--   • public.games exists with columns: id, slug, (optionally) max_score.
--   • public.user_profiles exists with columns: auth_user_id, display_name.
--   • If public.games does NOT yet have a max_score column, uncomment Section 0.
-- =============================================================================


-- =============================================================================
-- 0. (OPTIONAL) Add per-game score cap column if it doesn't exist yet.
--    Uncomment the block below if you haven't added this column already.
-- =============================================================================
-- alter table public.games
--   add column if not exists max_score double precision
--   default 100000;
--
-- comment on column public.games.max_score is
--   'Per-game upper bound for submitted scores. Defaults to 100 000.';


-- =============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =============================================================================
-- RLS acts as a safety net: even if someone accidentally re-grants direct
-- privileges later, the table is locked by default unless an explicit policy
-- exists. The SECURITY DEFINER function bypasses RLS (it runs as the function
-- owner), so the submit path is unaffected.
-- =============================================================================

create table if not exists public.leaderboard_scores (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  score double precision not null check (score >= 0),
  score_meta jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create index if not exists idx_leaderboard_scores_game_score
  on public.leaderboard_scores (game_id, score desc);

create index if not exists idx_leaderboard_scores_user_game
  on public.leaderboard_scores (user_id, game_id);

alter table public.leaderboard_scores enable row level security;


-- =============================================================================
-- 2. REVOKE ALL DIRECT TABLE ACCESS
-- =============================================================================
-- No role should touch leaderboard_scores directly. All reads go through the
-- view; all writes go through the submit function.
-- =============================================================================

revoke all on public.leaderboard_scores from anon;
revoke all on public.leaderboard_scores from authenticated;
revoke all on public.leaderboard_scores from public;


-- =============================================================================
-- 3. CUSTOM RETURN TYPE
-- =============================================================================
-- Instead of RETURNING * (which leaks user_id, id, and the full score_meta
-- row back to the caller), the submit function returns only the fields the
-- client actually needs.
-- =============================================================================

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'leaderboard_submit_result'
  ) then
    create type public.leaderboard_submit_result as (
      game_id    uuid,
      score      double precision,
      recorded_at timestamptz,
      updated_at  timestamptz
    );
  end if;
end
$$;


-- =============================================================================
-- 4. PUBLIC LEADERBOARD VIEW (with display names)
-- =============================================================================
-- This is the ONLY read path for leaderboard data. It joins through profiles
-- so the frontend gets a human-readable name without ever seeing user_id.
-- =============================================================================

create or replace view public.leaderboard_public
with (security_invoker = true) as
select
  ls.game_id,
  g.slug        as game_slug,
  p.display_name,
  ls.score,
  ls.recorded_at,
  ls.updated_at
from public.leaderboard_scores ls
join public.games    g on g.id = ls.game_id
join public.user_profiles p on p.auth_user_id = ls.user_id;

-- Both anon and authenticated can read the leaderboard.
-- Anon access means anyone with the project URL + anon key can query this;
-- that is intentional for a public-facing STEM games portal.
grant select on public.leaderboard_public to anon, authenticated;


-- =============================================================================
-- 5. SUBMIT FUNCTION (stricter validation + rate limiting)
-- =============================================================================

create or replace function public.submit_leaderboard_score(
  p_game_slug    text,
  p_score        double precision,
  p_only_if_higher boolean default true,
  p_score_meta   jsonb   default '{}'::jsonb
)
returns public.leaderboard_submit_result
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_game_id   uuid;
  v_max_score double precision;
  v_result    public.leaderboard_submit_result;
begin
  -- -----------------------------------------------------------------------
  -- 5a. Authentication
  -- -----------------------------------------------------------------------
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated.'
      using errcode = '28000';         -- invalid_authorization_specification
  end if;

  -- -----------------------------------------------------------------------
  -- 5b. Input validation
  -- -----------------------------------------------------------------------
  if p_game_slug is null or btrim(p_game_slug) = '' then
    raise exception 'Game slug is required.'
      using errcode = '22023';         -- invalid_parameter_value
  end if;

  if p_score is null or p_score < 0 then
    raise exception 'Score must be a non-negative number.'
      using errcode = '22023';
  end if;

  -- Prevent huge metadata blobs (4 KB cap).
  if pg_column_size(coalesce(p_score_meta, '{}'::jsonb)) > 4096 then
    raise exception 'Score metadata too large (max 4 096 bytes).'
      using errcode = '22023';
  end if;

  -- -----------------------------------------------------------------------
  -- 5c. Game lookup + per-game score cap
  -- -----------------------------------------------------------------------
  select g.id, coalesce(g.max_score, 100000)
  into   v_game_id, v_max_score
  from   public.games g
  where  g.slug = p_game_slug
  limit  1;

  if v_game_id is null then
    raise exception 'Game "%" not found.', p_game_slug
      using errcode = '22023';
  end if;

  if p_score > v_max_score then
    raise exception 'Score % exceeds the allowed maximum of % for this game.',
      p_score, v_max_score
      using errcode = '22023';
  end if;

  -- -----------------------------------------------------------------------
  -- 5d. Lightweight rate limiting (1 submission per 2 seconds per user+game)
  -- -----------------------------------------------------------------------
  -- This catches tight client loops and casual spam. It is not bulletproof
  -- against highly concurrent bursts (two requests that both pass the check
  -- before either writes), but it covers the common case. For stronger
  -- protection, layer in edge-function or proxy rate limiting.
  -- -----------------------------------------------------------------------
  perform 1
  from public.leaderboard_scores
  where user_id = v_user_id
    and game_id = v_game_id
    and updated_at > now() - interval '2 seconds';

  if found then
    raise exception 'Too many submissions. Please wait a moment before retrying.'
      using errcode = '22023';
  end if;

  -- -----------------------------------------------------------------------
  -- 5e. Upsert (insert or keep-best-score update)
  -- -----------------------------------------------------------------------
  insert into public.leaderboard_scores as ls (
    user_id, game_id, score, score_meta, recorded_at, updated_at
  )
  values (
    v_user_id,
    v_game_id,
    p_score,
    coalesce(p_score_meta, '{}'::jsonb),
    now(),
    now()
  )
  on conflict (user_id, game_id)
  do update set
    score = case
      when p_only_if_higher then greatest(ls.score, excluded.score)
      else excluded.score
    end,
    score_meta = case
      when p_only_if_higher and excluded.score < ls.score then ls.score_meta
      else excluded.score_meta
    end,
    recorded_at = case
      when p_only_if_higher and excluded.score < ls.score then ls.recorded_at
      else now()
    end,
    updated_at = now();

  -- Return only the safe subset of columns.
  select ls.game_id, ls.score, ls.recorded_at, ls.updated_at
  into   v_result
  from   public.leaderboard_scores ls
  where  ls.user_id = v_user_id
    and  ls.game_id = v_game_id;

  return v_result;
end;
$$;


-- =============================================================================
-- 6. FUNCTION PRIVILEGES
-- =============================================================================
-- Grant execute to authenticated only, and explicitly revoke from anon and the
-- public pseudo-role. PostgreSQL grants EXECUTE on functions to PUBLIC by
-- default, so without the revoke an anon caller could invoke the function
-- (the auth.uid() check would still block them, but defense in depth is
-- cleaner and auditable).
-- =============================================================================

revoke execute on function public.submit_leaderboard_score(text, double precision, boolean, jsonb)
  from anon, public;

grant execute on function public.submit_leaderboard_score(text, double precision, boolean, jsonb)
  to authenticated;


-- =============================================================================
-- 7. DONE
-- =============================================================================
-- Summary of the security posture:
--
--   Layer 1 – Privileges:  All direct DML on leaderboard_scores is revoked
--                          from every consumer role (anon, authenticated, public).
--
--   Layer 2 – RLS:         Row Level Security is enabled with no permissive
--                          policies, so even an accidental re-grant is blocked.
--
--   Layer 3 – View:        The only read path is leaderboard_public, which
--                          exposes display_name (never user_id) joined from
--                          profiles.
--
--   Layer 4 – Function:    The only write path is submit_leaderboard_score,
--                          which validates auth, input bounds, per-game score
--                          caps, metadata size, and a 2-second rate limit
--                          before performing a safe upsert.
--
--   Layer 5 – Return type: The function returns a custom composite type
--                          (leaderboard_submit_result) so the caller never
--                          receives user_id, row id, or raw score_meta.
--
--   Layer 6 – Revokes:     EXECUTE on the submit function is explicitly
--                          revoked from anon and public, not just implicitly
--                          ungrantable.
-- =============================================================================