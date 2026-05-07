// Upload profile avatars to Supabase Storage (configure bucket + policies in Supabase).
import { supabase } from "./client";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET ?? "avatars";

/** Max avatar size shown in UI (profile.avatarTooLarge). */
export const AVATAR_MAX_MB = 10;
export const AVATAR_MAX_BYTES = AVATAR_MAX_MB * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

/** Verify file magic bytes match a real raster image (not just file.type). */
async function sniffImageMime(file: File): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (
    buf.length >= 6
    && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38
    && (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    buf.length >= 12
    && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function appendCacheBuster(publicUrl: string): string {
  try {
    const u = new URL(publicUrl);
    u.searchParams.set("v", String(Date.now()));
    return u.toString();
  } catch {
    const sep = publicUrl.includes("?") ? "&" : "?";
    return `${publicUrl}${sep}v=${Date.now()}`;
  }
}

async function removeOtherUserMediaInFolder(
  userId: string,
  keepPath: string,
  filePrefix: string
): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(userId, { limit: 100 });
    if (listError || !files?.length) return;

    const toRemove = files
      .filter((f) => f.name.startsWith(filePrefix))
      .map((f) => `${userId}/${f.name}`)
      .filter((path) => path !== keepPath);
    if (toRemove.length === 0) return;

    await supabase.storage.from(BUCKET).remove(toRemove);
  } catch {
    /* listing/removal is best-effort (RLS or empty folder) */
  }
}

export type AvatarUploadErrorCode =
  | "not_authenticated"
  | "invalid_type"
  | "too_large"
  | "upload_failed";

/** Size + magic-byte checks before crop or upload (no auth). */
export async function validateAvatarFileForUpload(
  file: File
): Promise<{ ok: true; contentType: string } | { ok: false; code: AvatarUploadErrorCode }> {
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, code: "too_large" };

  const sniffed = await sniffImageMime(file);
  if (!sniffed || !ALLOWED_TYPES.has(sniffed)) return { ok: false, code: "invalid_type" };

  if (file.type) {
    if (!ALLOWED_TYPES.has(file.type)) return { ok: false, code: "invalid_type" };
    if (file.type !== sniffed) return { ok: false, code: "invalid_type" };
  }

  return { ok: true, contentType: sniffed };
}

export async function uploadUserAvatar(
  file: File
): Promise<
  | { ok: true; publicUrl: string }
  | { ok: false; code: AvatarUploadErrorCode; message: string }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, code: "not_authenticated", message: "Not authenticated" };
  }

  const pre = await validateAvatarFileForUpload(file);
  if (!pre.ok) {
    return { ok: false, code: pre.code, message: pre.code };
  }

  const contentType = pre.contentType;
  const ext = extensionForMime(contentType);
  const path = `${user.id}/avatar-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType,
    cacheControl: "3600",
  });

  if (uploadError) {
    return { ok: false, code: "upload_failed", message: uploadError.message };
  }

  await removeOtherUserMediaInFolder(user.id, path, "avatar-");

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, publicUrl: appendCacheBuster(urlData.publicUrl) };
}

export async function uploadUserBanner(
  file: File
): Promise<
  | { ok: true; publicUrl: string }
  | { ok: false; code: AvatarUploadErrorCode; message: string }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, code: "not_authenticated", message: "Not authenticated" };
  }

  const pre = await validateAvatarFileForUpload(file);
  if (!pre.ok) {
    return { ok: false, code: pre.code, message: pre.code };
  }

  const contentType = pre.contentType;
  const ext = extensionForMime(contentType);
  const path = `${user.id}/banner-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType,
    cacheControl: "3600",
  });

  if (uploadError) {
    return { ok: false, code: "upload_failed", message: uploadError.message };
  }

  await removeOtherUserMediaInFolder(user.id, path, "banner-");

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, publicUrl: appendCacheBuster(urlData.publicUrl) };
}
