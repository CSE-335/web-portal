// ============================================================================
// Scrollable log of past dialogue exchanges.
// ============================================================================

"use client";

import { useRef, useEffect } from "react";
import { Box, Text, ScrollArea, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import { CloseIcon } from "./icons";
import { SPEAKER_THEME } from "../speakerTheme";
import type { AssistantResponse } from "../types";

function isUserMessage(response: AssistantResponse): boolean {
  return (
    response.lines.length === 1 && response.lines[0].speaker === "You"
  );
}

function HistoryEntry({
  response,
  index,
}: {
  response: AssistantResponse;
  index: number;
}) {
  const isUser = isUserMessage(response);

  return (
    <Box
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid var(--border-subtle)",
        ...(isUser && {
          background: "rgba(52, 211, 153, 0.06)",
          borderLeft: "2px solid rgba(52, 211, 153, 0.3)",
        }),
      }}
    >
      {!isUser && (
        <Text size="10px" c="dimmed" mb={4} style={{ opacity: 0.4 }}>
          Exchange {index + 1}
        </Text>
      )}
      {response.lines.map((line, i) => (
        <Box key={i} mb={4}>
          <Text
            component="span"
            size="xs"
            fw={600}
            style={{ color: SPEAKER_THEME[line.speaker].nameColor }}
          >
            {SPEAKER_THEME[line.speaker].displayName}:
          </Text>{" "}
          <Text component="span" size="xs" style={{ color: "var(--text-primary)", opacity: 0.85 }}>
            {line.text}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export default function DialogueHistory() {
  const { state, dispatch } = useAssistant();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [state.history.length]);

  if (!state.historyOpen || state.history.length === 0) return null;

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: 680,
        margin: "0 auto 8px",
        background: "var(--surface-primary)",
        border: "1px solid var(--overlay-border)",
        borderRadius: 10,
        backdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <Group
        justify="space-between"
        px="sm"
        py={6}
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <Text size="xs" fw={600} c="dimmed">
          Dialogue Log ({state.history.length})
        </Text>
        <Tooltip label="Close log">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            onClick={() => dispatch({ type: "TOGGLE_HISTORY" })}
            aria-label="Close history"
          >
            <CloseIcon size={10} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <ScrollArea h={220} viewportRef={viewportRef} scrollbarSize={4}>
        {state.history.map((response, i) => (
          <HistoryEntry key={i} response={response} index={i} />
        ))}
      </ScrollArea>
    </Box>
  );
}
