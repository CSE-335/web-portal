import { Box } from "@mantine/core";

type GameEmbedProps = {
  src: string;
  title: string;
  height?: string;
};

export default function GameEmbed({
  src,
  title,
  height = "800px",
}: GameEmbedProps) {
  return (
    <Box style={{ overflow: "hidden", borderRadius: 20, background: "rgba(0,0,0,0.2)" }}>
      <iframe
        src={src}
        title={title}
        style={{ display: "block", width: "100%", height, border: 0 }}
        allow="microphone; autoplay"
        allowFullScreen
      />
    </Box>
  );
}
