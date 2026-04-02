// ============================================================================
// Timer that auto-advances dialogue lines when autoplay is enabled.
// Separated from the panel so the timing logic is testable.
// ============================================================================

"use client";

import { useEffect } from "react";
import { useAssistant } from "../AssistantContext";

export function useAutoAdvance() {
  const { state, config, advanceLine } = useAssistant();

  useEffect(() => {
    // When voice is enabled, TTS playDialogue handles advancing -- don't race it
    if (!state.autoplayEnabled || state.voiceEnabled) return;
    if (!state.currentDialogue || state.isMinimized) return;

    const isLastLine =
      state.currentLineIndex >= state.currentDialogue.lines.length - 1;
    if (isLastLine) return;

    const timer = setTimeout(advanceLine, config.autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [
    state.autoplayEnabled,
    state.voiceEnabled,
    state.currentLineIndex,
    state.currentDialogue,
    state.isMinimized,
    config.autoAdvanceMs,
    advanceLine,
  ]);
}