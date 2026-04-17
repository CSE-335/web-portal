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
      radius={28}
      style={{
        overflow: "hidden",
        background: "var(--player-bg)",
        border: "1px solid var(--player-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Box p="xs">
        <Box
          ref={embedRef}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
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
