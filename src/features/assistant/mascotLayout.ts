// ============================================================================
// Single source of truth for mascot / VN sprite geometry. Uses fluid clamp()
// (rem + vw + dvh) so sizes scale on phones without duplicating magic numbers.
// ============================================================================

const rem = (n: number) => `${n}rem`;

/** Vertical size: floor in rem, prefer dvh on short screens, hit maxRem on tall desktops. */
function fluidHeight(minRem: number, dvh: number, maxRem: number): string {
  return `clamp(${rem(minRem)}, min(${dvh}dvh, ${rem(maxRem)}), ${rem(maxRem)})`;
}

/** Width: same idea — vw scales mid-size screens, rem cap dominates on wide desktop. */
function fluidWidthBounded(minRem: number, vw: number, maxRem: number): string {
  return `clamp(${rem(minRem)}, min(${vw}vw, ${rem(maxRem)}), ${rem(maxRem)})`;
}

export const MASCOT_VN_LAYOUT = {
  /** Full-body sprites in the dialogue overlay */
  spriteWidth: fluidWidthBounded(7, 36, 34),
  spriteHeight: fluidHeight(12, 56, 43),
  /** Keep both sprites on-screen on narrow widths */
  spriteSideInset: "clamp(0.25rem, min(5vw, 3rem), 3rem)",
  /** Sprite strip matches sprite height */
  stageHeight: fluidHeight(12, 56, 43),
  /** Clears bottom dialogue + safe area; shrinks on short viewports */
  stageBottom: "clamp(5.5rem, min(28dvh, 10rem), 11rem)",
} as const;

/**
 * Single active speaker beside the dialogue (narrow / portrait phones).
 * Caps dvh so busts never consume half the screen like the desktop stage layout.
 */
export const MASCOT_VN_LAYOUT_COMPACT = {
  spriteWidth: fluidWidthBounded(3.5, 24, 9),
  spriteHeight: fluidHeight(5.5, 20, 11),
  spriteSideInset: "0",
  stageHeight: fluidHeight(5.5, 20, 11),
  stageBottom: "0",
} as const;

/** Circular portraits when no explicit pixel size is passed */
export const MASCOT_PORTRAIT_FLUID_SIZE = "clamp(4rem, 12vw, 6.375rem)";
