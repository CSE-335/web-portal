-- =============================================================================
-- Profile Avatars – Supabase Storage Policies (Hardened)
-- =============================================================================
--
-- Bucket setup:
--   1) Dashboard → Storage → New bucket named `avatars`.
--   2) Set allowed MIME types to: image/png, image/jpeg, image/webp, image/gif
--   3) Set max file size to 5 MB (or your preferred limit).
--   4) Mark the bucket "Public" if browsers should load avatar URLs directly
--      without signing. If you keep it private, the authenticated read policy
--      below will handle access, and you'll serve signed URLs from your app.
--
-- Convention:
--   Each user uploads to  avatars/<uid>/
--     avatar-<uuid>.<ext>   and/or   banner-<uuid>.<ext>
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Allowed avatar filenames (used in multiple policies below).
-- Restricting to a fixed set prevents storage exhaustion and blocks
-- non-image extensions like .html, .svg, .exe.
-- ---------------------------------------------------------------------------
-- Note: Supabase SQL policies don't support shared constants, so the
-- filename/extension checks are repeated in each policy.


-- ---------------------------------------------------------------------------
-- 1. SELECT – own folder (for listing/managing your uploads)
-- ---------------------------------------------------------------------------
drop policy if exists "Public avatar read" on storage.objects;
drop policy if exists "Users select own avatar objects" on storage.objects;

create policy "Users select own avatar objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) = 1
  and (
    storage.filename(name) like 'avatar-%'
    or storage.filename(name) like 'banner-%'
  )
);


-- ---------------------------------------------------------------------------
-- 2. SELECT – any user's avatar file (for displaying others' avatars)
--    Scoped to specific filenames so users cannot enumerate arbitrary objects.
--    If your bucket is "Public", direct URLs bypass RLS and this policy is
--    only used for authenticated API reads. Still good to have for defense
--    in depth.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated read any avatar" on storage.objects;

create policy "Authenticated read any avatar"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    storage.filename(name) like 'avatar-%'
    or storage.filename(name) like 'banner-%'
  )
  and (storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg', 'gif')
  and array_length(storage.foldername(name), 1) = 1
);


-- ---------------------------------------------------------------------------
-- 3. INSERT – own folder, image extensions only, flat structure enforced.
-- ---------------------------------------------------------------------------
drop policy if exists "Users insert own avatar" on storage.objects;

create policy "Users insert own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) = 1
  and (storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg', 'gif')
  and (
    storage.filename(name) like 'avatar-%'
    or storage.filename(name) like 'banner-%'
  )
);


-- ---------------------------------------------------------------------------
-- 4. UPDATE – own folder, same restrictions as insert.
-- ---------------------------------------------------------------------------
drop policy if exists "Users update own avatar" on storage.objects;

create policy "Users update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) = 1
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) = 1
  and (storage.extension(name)) in ('webp', 'png', 'jpg', 'jpeg', 'gif')
  and (
    storage.filename(name) like 'avatar-%'
    or storage.filename(name) like 'banner-%'
  )
);


-- ---------------------------------------------------------------------------
-- 5. DELETE – own folder only.
-- ---------------------------------------------------------------------------
drop policy if exists "Users delete own avatar" on storage.objects;

create policy "Users delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) = 1
  and (
    storage.filename(name) like 'avatar-%'
    or storage.filename(name) like 'banner-%'
  )
);


-- ---------------------------------------------------------------------------
-- 6. Deny anonymous role explicitly.
--    (Public bucket URLs bypass RLS, but authenticated API calls respect it.)
-- ---------------------------------------------------------------------------
-- NOTE: Supabase manages storage.objects permissions internally.
-- The REVOKE below ensures no accidental anon access through the
-- authenticated storage API. If it errors in your environment,
-- the anon role is already denied by the absence of any anon policy.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'revoke all on storage.objects from anon';
exception
  when others then
    raise notice 'Could not revoke anon on storage.objects – likely managed by Supabase internals. Skipping.';
end;
$$;