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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <Paper
      component="section"
      radius={28}
      style={{
        overflow: "hidden",
        background: "rgba(34, 38, 63, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.30)",
      }}
    >
      <SaveProgressBanner />

      <Box p="xs">
        <Box
          style={{
            overflow: "hidden",
            background: "linear-gradient(180deg, #2A2F56 0%, #202542 100%)",
          }}
        >
          <GameEmbed src={iframeSrc} title={title} height={embedHeight} slug={slug} />
        </Box>
      </Box>

      <GameToolbar title={title} subject={subject} iframeSrc={iframeSrc} />
    </Paper>
  );
}
