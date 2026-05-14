// ============================================================================
// Compact pill shown when the panel is minimized.
// ============================================================================

"use client";

import { Paper, Group, Text } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import MascotPortrait from "./MascotPortrait";

export default function MinimizedPill() {
  const { dispatch } = useAssistant();

  return (
    <Paper
      shadow="lg"
      radius="xl"
      px="md"
      py="xs"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dispatch({ type: "MAXIMIZE" });
        }
      }}
      className="assistant-minimized-pill"
      onClick={() => dispatch({ type: "MAXIMIZE" })}
      styles={{
        root: {
          background: "var(--surface-primary)",
          border: "1px solid var(--overlay-border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backdropFilter: "blur(12px)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          minHeight: 44,
        },
      }}
    >
      <Group gap={6}>
        <MascotPortrait speaker="Laurie" size={28} />
        <MascotPortrait speaker="Livvy" size={28} />
      </Group>
      <Text size="xs" c="dimmed" fw={600}>
        Tutors
      </Text>
    </Paper>
  );
}
