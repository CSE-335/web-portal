-- =============================================================================
-- Friends + Presence Schema for Supabase (Hardened)
-- Run in the SQL editor after your base auth schema is in place.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ===========================================================================
-- 1. FRIENDSHIPS
-- ===========================================================================

create table if not exists public.friendships (
  id            uuid        primary key default gen_random_uuid(),
  requester_id  uuid        not null references auth.users(id) on delete cascade,
  addressee_id  uuid        not null references auth.users(id) on delete cascade,
  status        text        not null default 'pending'
                            check (status in ('pending', 'accepted', 'blocked')),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz null,

  -- prevent self-friending
  check (requester_id <> addressee_id)
);

-- Unique pair regardless of who sent the request.
create unique index if not exists friendships_pair_unique
  on public.friendships (
    least(requester_id::text, addressee_id::text),
    greatest(requester_id::text, addressee_id::text)
  );

create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);
create index if not exists friendships_status_idx    on public.friendships (status);

-- Composite index to speed up the rate-limit check in the trigger below.
create index if not exists friendships_requester_created_idx
  on public.friendships (requester_id, created_at desc);


-- ---------------------------------------------------------------------------
-- 1a. Rate-limit trigger (replaces the in-policy subquery)
--     Serialises the check per-user with an advisory lock so concurrent
--     inserts cannot race past the limit.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_friendship_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Advisory lock keyed on the requester to serialise concurrent inserts.
  perform pg_advisory_xact_lock(hashtext(new.requester_id::text));

  if (
    select count(*)
    from public.friendships
    where requester_id = new.requester_id
      and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'Rate limit: you may send at most 30 friend requests per hour.'
      using errcode = 'P0001';
  end if;

  -- Block sending a request to someone who has blocked you (in either
  -- direction) or to someone you have already blocked.
  if exists (
    select 1
    from public.friendships
    where status = 'blocked'
      and (
        (requester_id = new.requester_id and addressee_id = new.addressee_id)
        or (requester_id = new.addressee_id and addressee_id = new.requester_id)
      )
  ) then
    raise exception 'Cannot send a friend request to this user.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_friendship_rate_limit on public.friendships;
create trigger trg_friendship_rate_limit
  before insert on public.friendships
  for each row
  execute function public.enforce_friendship_rate_limit();


-- ---------------------------------------------------------------------------
-- 1b. Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.friendships enable row level security;

-- SELECT: see rows you are part of.
drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own"
  on public.friendships for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- INSERT: you can only create rows where you are the requester.
-- Rate limiting and block checks are handled by the trigger above.
drop policy if exists "friendships_insert_request" on public.friendships;
create policy "friendships_insert_request"
  on public.friendships for insert to authenticated
  with check (auth.uid() = requester_id);

-- UPDATE: only the addressee may accept a pending request.
-- Column-level grants below ensure only status + responded_at are writable.
drop policy if exists "friendships_update_addressee_accept" on public.friendships;
create policy "friendships_update_addressee_accept"
  on public.friendships for update to authenticated
  using (
    auth.uid() = addressee_id
    and status = 'pending'
  )
  with check (
    auth.uid() = addressee_id
    and status in ('accepted', 'blocked')
    and responded_at is not null
  );

-- DELETE: either participant can remove the friendship.
drop policy if exists "friendships_delete_participant" on public.friendships;
create policy "friendships_delete_participant"
  on public.friendships for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ---------------------------------------------------------------------------
-- 1d. Game likes — friends can read each other’s liked games
-- ---------------------------------------------------------------------------
alter table public.game_likes enable row level security;

drop policy if exists "game_likes_select_self_or_friend" on public.game_likes;
create policy "game_likes_select_self_or_friend"
  on public.game_likes for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = game_likes.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = game_likes.user_id)
        )
    )
  );

revoke all on public.game_likes from anon;


-- ---------------------------------------------------------------------------
-- 1c. Column-level grants – prevent mutating requester/addressee/created_at.
-- ---------------------------------------------------------------------------
revoke update on public.friendships from authenticated;
grant  update (status, responded_at) on public.friendships to authenticated;

-- Explicitly deny the anonymous role any access.
revoke all on public.friendships from anon;


-- ===========================================================================
-- 2. USER PRESENCE
-- ===========================================================================

create table if not exists public.user_presence (
  user_id           uuid        primary key references auth.users(id) on delete cascade,
  is_online         boolean     not null default false,
  current_game_slug text        null,
  last_seen         timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Length cap.
  constraint user_presence_game_slug_len check (
    current_game_slug is null or char_length(current_game_slug) <= 120
  ),

  -- Format: lowercase alphanumeric + hyphens, no leading/trailing hyphen.
  constraint user_presence_game_slug_format check (
    current_game_slug is null
    or current_game_slug ~ '^[a-z0-9][a-z0-9\-]{0,118}[a-z0-9]$'
  )
);

create index if not exists user_presence_online_idx    on public.user_presence (is_online);
create index if not exists user_presence_last_seen_idx on public.user_presence (last_seen desc);


-- ---------------------------------------------------------------------------
-- 2a. Auto-update the updated_at timestamp on every write.
--     Prevents clients from spoofing their last-active time.
-- ---------------------------------------------------------------------------
create or replace function public.set_presence_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_presence_updated_at on public.user_presence;
create trigger trg_presence_updated_at
  before update on public.user_presence
  for each row
  execute function public.set_presence_updated_at();


-- ---------------------------------------------------------------------------
-- 2b. Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.user_presence enable row level security;

-- SELECT: see your own presence, or the presence of accepted friends.
drop policy if exists "presence_select_self_or_friends" on public.user_presence;
create policy "presence_select_self_or_friends"
  on public.user_presence for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = user_id)
        )
    )
  );

-- INSERT: you can only create your own presence row.
drop policy if exists "presence_upsert_self" on public.user_presence;
create policy "presence_upsert_self"
  on public.user_presence for insert to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: you can only update your own presence row.
-- Column-level grants below prevent mutating user_id.
drop policy if exists "presence_update_self" on public.user_presence;
create policy "presence_update_self"
  on public.user_presence for update to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 2c. Column-level grants – prevent mutating user_id via update.
-- ---------------------------------------------------------------------------
revoke update on public.user_presence from authenticated;
grant  update (is_online, current_game_slug, last_seen, updated_at)
  on public.user_presence to authenticated;

-- Explicitly deny the anonymous role any access.
revoke all on public.user_presence from anon;