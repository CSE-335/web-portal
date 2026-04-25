"use client";

import { Box, Paper } from "@mantine/core";
import SaveProgressBanner from "./SaveProgressBanner";
import GameEmbed from "./GameEmbed";
import GameToolbar from "./GameToolbar";
import { useRef } from "react";

type GamePlayerProps = {
  title: string;
  subject: string;
  iframeSrc: string;
  embedHeight?: string;
  slug: string;
};

export default function GamePlayer({
  title,
  subject,
  iframeSrc,
  embedHeight = "760px",
  slug,
}: GamePlayerProps) {
  const embedRef = useRef<HTMLDivElement>(null);

  return (
    <Paper
      component="section"
      style={{
        overflow: "hidden",
        borderRadius: "clamp(16px, 3vw, 28px)",
        background: "var(--player-bg)",
        border: "1px solid var(--player-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Box p={{ base: 6, md: "xs" }}>
        <Box
          ref={embedRef}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "clamp(14px, 2.5vw, 20px)",
            background: "var(--player-embed-bg)",
          }}
        >
          <SaveProgressBanner />
          <GameEmbed src={iframeSrc} title={title} height={embedHeight} slug={slug} />
        </Box>
      </Box>

      <GameToolbar slug={slug} title={title} subject={subject} iframeSrc={iframeSrc} embedRef={embedRef} />
    </Paper>
  );
}
