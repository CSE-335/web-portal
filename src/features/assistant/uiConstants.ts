/**
 * Stacking inside the player (`game-mobile-immersive-root` / fullscreen stacking context).
 * Must sit above `.game-mobile-immersive-hint` (~10110) and below `.game-mobile-fs-exit` (10150).
 */
export const ASSISTANT_UI_Z = {
  overlayBackdrop: 1,
  /** Twin mascots strip */
  mascotStage: 2,
  /** Dialogue stack (VN box, toolbar, chat) — above mascots so text stays readable */
  dialogueColumn: 5,
  /** Full-assistant layers (VN shell, pill, typing-only bar, chat-only) */
  fixedLayer: 10122,
  toast: 10138,
  tooltip: 10130,
} as const;
