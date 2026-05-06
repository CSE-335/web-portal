-- Profile avatars (Supabase Storage)
--
-- Bucket setup:
--   1) Dashboard → Storage → New bucket named `avatars` (or NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET).
--   2) Mark the bucket "Public" ONLY if browsers should load URLs without signing. For tighter
--      control, keep the bucket private and serve signed URLs via an Edge Function.
--
-- Hardening:
--   - Avoid a blanket SELECT policy on the whole bucket: it lets anyone LIST every object path.
--   - When the bucket stays public, direct file URLs typically still work; authenticated SELECT
--     own-folder grants list/remove for uploads (see prune in src/lib/supabase/avatar-storage.ts).

drop policy if exists "Public avatar read" on storage.objects;

create policy "Users select own avatar objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users insert own avatar" on storage.objects;
create policy "Users insert own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
