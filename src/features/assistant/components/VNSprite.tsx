// ============================================================================
// Active speaker is fully opaque + slightly scaled up.
// Inactive speaker dims and scales down subtly.
// ============================================================================

"use client";

import { Box } from "@mantine/core";
import type { Speaker, MascotEmotion } from "../types";
import { useAssistant } from "../AssistantContext";
import { MASCOT_VN_LAYOUT } from "../mascotLayout";
import { SPEAKER_THEME } from "../speakerTheme";

interface VNSpriteProps {
  speaker: Speaker;
  emotion?: MascotEmotion;
  isActive: boolean;
  /** Override default side positioning */
  side?: "left" | "right";
}

export default function VNSprite({
  speaker,
  emotion = "idle",
  isActive,
  side,
}: VNSpriteProps) {
  const { config } = useAssistant();

  // Default: Laurie on left, Livvy on right
  const placement = side ?? (speaker === "Laurie" ? "left" : "right");

  const basePath = `${config.mascotAssetPath}/${speaker.toLowerCase()}`;
  const ext = config.mascotAssetExtension;
  const imageSrc = `${basePath}/${emotion}.${ext}`;
  const fallbackSrc = `${basePath}/idle.${ext}`;

  return (
    <Box
      style={{
        position: "absolute",
        bottom: 0,
        [placement]: MASCOT_VN_LAYOUT.spriteSideInset,
        width: MASCOT_VN_LAYOUT.spriteWidth,
        height: MASCOT_VN_LAYOUT.spriteHeight,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: placement === "left" ? "flex-start" : "flex-end",
        pointerEvents: "none",
        // Active/inactive transitions
        opacity: isActive ? 1 : 0.4,
        transform: isActive
          ? "scale(1) translateY(0)"
          : "scale(0.92) translateY(8px)",
        filter: isActive ? "none" : "brightness(0.6) saturate(0.7)",
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* Subtle glow behind active speaker */}
      {isActive && (
        <Box
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70%",
            height: "40%",
            background: `radial-gradient(ellipse, ${SPEAKER_THEME[speaker].glow}, transparent 70%)`,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`${speaker} — ${emotion}`}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (!img.src.endsWith(`idle.${ext}`)) img.src = fallbackSrc;
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "bottom",
          position: "relative",
          zIndex: 1,
        }}
      />
    </Box>
  );
}