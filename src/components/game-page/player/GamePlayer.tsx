import { Box, Paper } from "@mantine/core";
import SaveProgressBanner from "./SaveProgressBanner";
import GameEmbed from "./GameEmbed";
import GameToolbar from "./GameToolbar";

type GamePlayerProps = {
  slug: string;
  title: string;
  subject: string;
  iframeSrc: string;
  embedHeight?: string;
};

export default function GamePlayer({
  slug,
  title,
  subject,
  iframeSrc,
  embedHeight = "760px",
}: GamePlayerProps) {
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
      <SaveProgressBanner />

      <Box p="xs">
        <Box
          style={{
            overflow: "hidden",
            background: "var(--player-embed-bg)",
          }}
        >
          <GameEmbed src={iframeSrc} title={title} height={embedHeight} />
        </Box>
      </Box>

      <GameToolbar slug={slug} title={title} subject={subject} iframeSrc={iframeSrc} />
    </Paper>
  );
}
