// ============================================================================
// Renders a single mascot's circular portrait with expression switching.
// ============================================================================

"use client";

import { Box } from "@mantine/core";
import type { Speaker, MascotEmotion } from "../types";
import { useAssistant } from "../AssistantContext";
import { MASCOT_PORTRAIT_FLUID_SIZE } from "../mascotLayout";

const COLORS: Record<Speaker, { accent: string; glow: string }> = {
  Laurie: { accent: "#60A5FA", glow: "rgba(96,165,250,0.4)" },
  Livvy:  { accent: "#F472B6", glow: "rgba(244,114,182,0.4)" },
  You:    { accent: "#34D399", glow: "rgba(52,211,153,0.4)" },
};

interface MascotPortraitProps {
  speaker: Speaker;
  emotion?: MascotEmotion;
  isActive?: boolean;
  /** Pixel size, or omit for fluid sizing (see mascotLayout) */
  size?: number;
}

export default function MascotPortrait({
  speaker,
  emotion = "idle",
  isActive = false,
  size,
}: MascotPortraitProps) {
  const { config } = useAssistant();
  const colors = COLORS[speaker];

  const basePath = `${config.mascotAssetPath}/${speaker.toLowerCase()}`;
  const ext = config.mascotAssetExtension;
  const imageSrc = `${basePath}/${emotion}.${ext}`;
  const fallbackSrc = `${basePath}/idle.${ext}`;

  const dim = size ?? MASCOT_PORTRAIT_FLUID_SIZE;

  return (
    <Box
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: isActive
          ? `2px solid ${colors.accent}`
          : "2px solid rgba(255,255,255,0.15)",
        boxShadow: isActive ? `0 0 12px ${colors.glow}` : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`${speaker} — ${emotion}`}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.src !== fallbackSrc) img.src = fallbackSrc;
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Box>
  );
}