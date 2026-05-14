// ============================================================================
// Compact action bar below the VN dialogue box.
// ============================================================================

"use client";

import { Group, Button, ActionIcon, Tooltip, Box } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import { ASSISTANT_UI_Z } from "../uiConstants";
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

export interface VNActionBarProps {
  compact?: boolean;
}

export default function VNActionBar({ compact }: VNActionBarProps) {
  const { state, dispatch, requestFollowUp, dismissDialogue } = useAssistant();

  if (!state.currentDialogue) return null;

  const btnStyle = {
    color: "var(--text-secondary)",
    fontSize: 14,
  };

  const iconControlSize = compact ? "lg" : "md";
  const iconControlProps = {
    variant: "subtle" as const,
    size: iconControlSize,
    style: { opacity: 0.7 },
  };

  const playbackControlIcons = [
    <Tooltip
      key="autoplay"
      label={state.autoplayEnabled ? "Stop auto-advance" : "Auto-advance"}
      zIndex={ASSISTANT_UI_Z.tooltip}
    >
      <ActionIcon
        {...iconControlProps}
        color={state.autoplayEnabled ? "blue" : "gray"}
        onClick={() => dispatch({ type: "TOGGLE_AUTOPLAY" })}
        aria-label="Toggle autoplay"
      >
        {state.autoplayEnabled ? <AutoplayOffIcon size={20} /> : <AutoplayIcon size={20} />}
      </ActionIcon>
    </Tooltip>,
    <Tooltip
      key="voice"
      label={state.voiceEnabled ? "Mute" : "Voice"}
      zIndex={ASSISTANT_UI_Z.tooltip}
    >
      <ActionIcon
        {...iconControlProps}
        color={state.voiceEnabled ? "blue" : "gray"}
        onClick={() => dispatch({ type: "TOGGLE_VOICE" })}
        aria-label="Toggle voice"
      >
        {state.voiceEnabled ? <VolumeIcon size={20} /> : <VolumeOffIcon size={20} />}
      </ActionIcon>
    </Tooltip>,
    <Tooltip
      key="history"
      label={state.historyOpen ? "Hide log" : "Dialogue log"}
      zIndex={ASSISTANT_UI_Z.tooltip}
    >
      <ActionIcon
        {...iconControlProps}
        color={state.historyOpen ? "blue" : "gray"}
        onClick={() => dispatch({ type: "TOGGLE_HISTORY" })}
        aria-label="Toggle dialogue history"
      >
        <HistoryIcon size={20} />
      </ActionIcon>
    </Tooltip>,
    <Tooltip key="skip-all" label="Skip all" zIndex={ASSISTANT_UI_Z.tooltip}>
      <ActionIcon
        {...iconControlProps}
        color="gray"
        onClick={dismissDialogue}
        aria-label="Skip"
      >
        <CloseIcon size={20} />
      </ActionIcon>
    </Tooltip>,
  ];

  const compactFollowUpIcons = [
    <Tooltip key="hint" label="Hint" zIndex={ASSISTANT_UI_Z.tooltip}>
      <ActionIcon
        variant="subtle"
        color="blue"
        size="lg"
        style={{ opacity: 0.9 }}
        onClick={() => requestFollowUp("hint")}
        disabled={state.isGenerating}
        aria-label="Hint"
      >
        <HintIcon size={20} />
      </ActionIcon>
    </Tooltip>,
    <Tooltip key="explain" label="Explain" zIndex={ASSISTANT_UI_Z.tooltip}>
      <ActionIcon
        variant="subtle"
        color="blue"
        size="lg"
        style={{ opacity: 0.9 }}
        onClick={() => requestFollowUp("explain")}
        disabled={state.isGenerating}
        aria-label="Explain"
      >
        <ExplainIcon size={20} />
      </ActionIcon>
    </Tooltip>,
    <Tooltip key="summarize" label="Summary" zIndex={ASSISTANT_UI_Z.tooltip}>
      <ActionIcon
        variant="subtle"
        color="blue"
        size="lg"
        style={{ opacity: 0.9 }}
        onClick={() => requestFollowUp("summarize")}
        disabled={state.isGenerating}
        aria-label="Summary"
      >
        <SummarizeIcon size={20} />
      </ActionIcon>
    </Tooltip>,
  ];

  if (compact) {
    return (
      <Box
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "6px auto 0",
          touchAction: "manipulation",
        }}
      >
        {/* One wrapping strip: follow-ups → playback — no split rows / dead center gap */}
        <Group
          gap={6}
          wrap="wrap"
          justify="flex-start"
          align="center"
          style={{ rowGap: 8, width: "100%" }}
        >
          {[...compactFollowUpIcons, ...playbackControlIcons]}
        </Group>
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: 680,
        margin: "8px auto 0",
      }}
    >
      <Group gap="xs" justify="space-between" wrap="wrap">
        <Group gap={6} wrap="wrap" style={{ alignItems: "stretch" }}>
          <Button
            variant="subtle"
            color="blue"
            size="compact-sm"
            leftSection={<HintIcon size={16} />}
            onClick={() => requestFollowUp("hint")}
            disabled={state.isGenerating}
            styles={{
              root: {
                ...btnStyle,
              },
            }}
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
            styles={{
              root: {
                ...btnStyle,
              },
            }}
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
            styles={{
              root: {
                ...btnStyle,
              },
            }}
          >
            Summary
          </Button>
        </Group>

        <Group gap={8} wrap="wrap">
          {playbackControlIcons}
        </Group>
      </Group>
    </Box>
  );
}