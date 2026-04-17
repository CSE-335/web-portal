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
      onClick={() => dispatch({ type: "MAXIMIZE" })}
      style={{
        background: "var(--surface-primary)",
        border: "1px solid var(--overlay-border)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        backdropFilter: "blur(12px)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "";
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
