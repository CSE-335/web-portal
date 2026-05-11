import type { GameMeta } from "@/data/games";

const DEFAULT_DESKTOP = "clamp(360px, 68dvh, 800px)";
const MOBILE_PLAY_AREA = "clamp(260px, calc(100dvh - 200px), min(92dvh, 900px))";

/**
 * Desktop vs mobile iframe heights. Nested embeds must not use raw `100vh` — that equals the
 * full window while the iframe sits under the site header and player chrome, which breaks layout
 * on phones (double scroll, unusably tall iframe slot).
 *
 * Mobile values reserve space for site header, player padding, bottom toolbar, and safe areas.
 */
export function resolveEmbedHeights(
  game: Pick<GameMeta, "slug" | "embedHeight">,
): { desktop: string; mobile: string } {
  const { embedHeight } = game;

  const raw = embedHeight?.trim();

  if (!raw) {
    return { desktop: DEFAULT_DESKTOP, mobile: MOBILE_PLAY_AREA };
  }

  if (/^\d+(\.\d+)?px$/i.test(raw)) {
    const n = parseFloat(raw);
    return {
      desktop: raw,
      mobile: `clamp(240px, min(${n}px, calc(100dvh - 200px)), ${n}px)`,
    };
  }

  if (raw === "100vh" || /^[\d.]+\s*vh$/i.test(raw)) {
    return {
      desktop:
        raw === "100vh"
          ? "clamp(520px, calc(100dvh - 140px), min(100dvh, 960px))"
          : raw,
      mobile: "clamp(260px, calc(100dvh - 200px), min(100dvh, 920px))",
    };
  }

  return { desktop: raw, mobile: MOBILE_PLAY_AREA };
}
