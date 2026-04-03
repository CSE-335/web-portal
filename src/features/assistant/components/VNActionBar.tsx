// ============================================================================
// Compact action bar below the VN dialogue box.
// ============================================================================

"use client";

import { Group, Button, ActionIcon, Tooltip, Box } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import {
  HintIcon,
  ExplainIcon,
  SummarizeIcon,
  CloseIcon,
  VolumeIcon,
  VolumeOffIcon,
  AutoplayIcon,
  AutoplayOffIcon,
  HistoryIcon,
} from "./icons";

export default function VNActionBar() {
  const { state, dispatch, requestFollowUp, dismissDialogue } = useAssistant();

  if (!state.currentDialogue) return null;

  const btnStyle = {
    color: "var(--text-secondary)",
    fontSize: 14,
  };

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: 680,
        margin: "8px auto 0",
      }}
    >
      <Group gap="xs" justify="space-between">
        <Group gap={6}>
          <Button
            variant="subtle"
            color="blue"
            size="compact-sm"
            leftSection={<HintIcon size={16} />}
            onClick={() => requestFollowUp("hint")}
            disabled={state.isGenerating}
            style={btnStyle}
          >
            Hint
          </Button>
          <Button
            variant="subtle"
            color="blue"
            size="compact-sm"
            leftSection={<ExplainIcon size={16} />}
            onClick={() => requestFollowUp("explain")}
            disabled={state.isGenerating}
            style={btnStyle}
          >
            Explain
          </Button>
          <Button
            variant="subtle"
            color="blue"
            size="compact-sm"
            leftSection={<SummarizeIcon size={16} />}
            onClick={() => requestFollowUp("summarize")}
            disabled={state.isGenerating}
            style={btnStyle}
          >
            Summary
          </Button>
        </Group>

        <Group gap={8}>
          <Tooltip label={state.autoplayEnabled ? "Stop auto-advance" : "Auto-advance"} zIndex={1000}>
            <ActionIcon
              variant="subtle"
              color={state.autoplayEnabled ? "blue" : "gray"}
              size="md"
              onClick={() => dispatch({ type: "TOGGLE_AUTOPLAY" })}
              style={{ opacity: 0.7 }}
              aria-label="Toggle autoplay"
            >
              {state.autoplayEnabled ? <AutoplayOffIcon size={20} /> : <AutoplayIcon size={20} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={state.voiceEnabled ? "Mute" : "Voice"} zIndex={1000}>
            <ActionIcon
              variant="subtle"
              color={state.voiceEnabled ? "blue" : "gray"}
              size="md"
              onClick={() => dispatch({ type: "TOGGLE_VOICE" })}
              style={{ opacity: 0.7 }}
              aria-label="Toggle voice"
            >
              {state.voiceEnabled ? <VolumeIcon size={20} /> : <VolumeOffIcon size={20} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={state.historyOpen ? "Hide log" : "Dialogue log"} zIndex={1000}>
            <ActionIcon
              variant="subtle"
              color={state.historyOpen ? "blue" : "gray"}
              size="md"
              onClick={() => dispatch({ type: "TOGGLE_HISTORY" })}
              style={{ opacity: 0.7 }}
              aria-label="Toggle dialogue history"
            >
              <HistoryIcon size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Skip all" zIndex={1000}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={dismissDialogue}
              style={{ opacity: 0.7 }}
              aria-label="Skip"
            >
              <CloseIcon size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}