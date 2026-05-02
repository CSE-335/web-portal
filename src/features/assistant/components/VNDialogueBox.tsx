// ============================================================================
// Visual novel-style dialogue box at the bottom of the screen.
// Shows one line at a time with a speaker name plate.
// Click anywhere on the box to advance to the next line.
// ============================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Text, Group, Loader } from "@mantine/core";
import { useAssistant } from "../AssistantContext";
import { SPEAKER_THEME } from "../speakerTheme";
import type { Speaker } from "../types";

// ---------------------------------------------------------------------------
// Typewriter hook — reveals text character by character
// ---------------------------------------------------------------------------

function useTypewriter(text: string, speed: number = 25) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    if (!text) {
      setIsDone(true);
      return;
    }

    const timer = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setIsDone(true);
        clearInterval(timer);
        timerRef.current = null;
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);
    timerRef.current = timer;

    return () => {
      clearInterval(timer);
      timerRef.current = null;
    };
  }, [text, speed]);

  // CRITICAL: clear the interval AND advance indexRef to the end. Otherwise
  // the next interval tick (~20 ms) would overwrite `displayed` with a
  // partial slice and the skip would visually do nothing.
  const skipToEnd = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    indexRef.current = text.length;
    setDisplayed(text);
    setIsDone(true);
  }, [text]);

  return { displayed, isDone, skipToEnd };
}

// ---------------------------------------------------------------------------
// Speaker name plate
// ---------------------------------------------------------------------------

function NamePlate({ speaker, compact }: { speaker: Speaker; compact?: boolean }) {
  const c = SPEAKER_THEME[speaker];

  return (
    <Box
      style={{
        position: "absolute",
        top: compact ? -12 : -16,
        left: compact ? 12 : speaker === "Laurie" ? 20 : "auto",
        right: compact ? "auto" : speaker === "Livvy" ? 20 : "auto",
        background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
        padding: compact ? "3px 14px" : "4px 20px",
        borderRadius: "8px 8px 0 0",
        boxShadow: `0 -4px 16px ${c.glow}`,
        zIndex: 2,
      }}
    >
      <Text size={compact ? "xs" : "sm"} fw={700} c="white" style={{ letterSpacing: "0.5px" }}>
        {c.displayName}
      </Text>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Advance indicator (blinking triangle)
// ---------------------------------------------------------------------------

function AdvanceIndicator() {
  return (
    <Box
      style={{
        position: "absolute",
        bottom: 12,
        right: 16,
        animation: "vnBounce 1s ease-in-out infinite",
      }}
    >
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M1 1L7 8L13 1" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <style>{`
        @keyframes vnBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(4px); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main dialogue box
// ---------------------------------------------------------------------------

export interface VNDialogueBoxProps {
  compact?: boolean;
}

export default function VNDialogueBox({ compact }: VNDialogueBoxProps) {
  const { state, advanceLine, dismissDialogue } = useAssistant();
  const dialogue = state.currentDialogue;

  // Current line being displayed
  const currentLine = dialogue?.lines[state.currentLineIndex];
  // During streaming, more lines may still arrive — the current "last" index
  // is only truly final once streaming has finished.
  const isLastLine =
    dialogue != null &&
    !state.isGenerating &&
    state.currentLineIndex >= dialogue.lines.length - 1;

  // Typewriter effect
  const { displayed, isDone, skipToEnd } = useTypewriter(
    currentLine?.text ?? "",
    20
  );

  // Click handler:
  //   1. Typing in progress → skip typewriter to end of this line.
  //   2. Typewriter done + more lines → advance to next line.
  //   3. Typewriter done + last line (and not streaming) → dismiss.
  //   4. Typewriter done + looks like last but streaming → just skip (no-op,
  //      wait for next line to arrive).
  const handleClick = useCallback(() => {
    if (!isDone) {
      skipToEnd();
    } else if (isLastLine) {
      dismissDialogue();
    } else if (
      dialogue &&
      state.currentLineIndex < dialogue.lines.length - 1
    ) {
      advanceLine();
    }
    // else: streaming but no next line yet — do nothing, wait for it.
  }, [isDone, isLastLine, skipToEnd, advanceLine, dismissDialogue, dialogue, state.currentLineIndex]);

  // Keyboard: space/enter to advance (skip when user is typing in an input)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
      if (e.key === "Escape") {
        dismissDialogue();
      }
    }

    if (state.isOpen && !state.isMinimized && dialogue) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [state.isOpen, state.isMinimized, dialogue, handleClick, dismissDialogue]);

  // Loading state — three cases:
  //   1. Streaming kicked off but no lines have arrived yet.
  //   2. Lines arrived but we are still prefetching the first line's audio
  //      (so the dialogue overlay does not flash up silently).
  //   3. (Edge) something dispatched a manual SET_AUDIO_BUFFERING.
  const hasNoLinesYet = !dialogue || dialogue.lines.length === 0;
  const isLoading =
    (state.isGenerating && hasNoLinesYet) || state.isAudioBuffering;

  if (isLoading) {
    return (
      <Box
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
          padding: compact ? "16px 14px" : "24px 28px",
          background: "var(--surface-primary)",
          border: "1px solid var(--overlay-border)",
          borderRadius: 12,
          backdropFilter: "blur(12px)",
        }}
      >
        <Group gap="sm" justify="center">
          <Loader size="sm" color="blue" />
          <Text size="sm" c="dimmed">
            The twins are discussing...
          </Text>
        </Group>
      </Box>
    );
  }

  if (!dialogue || !currentLine) return null;

  const speaker = currentLine.speaker;

  return (
    <Box
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 680,
        margin: "0 auto",
        cursor: "pointer",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {/* Name plate */}
      <NamePlate speaker={speaker} compact={compact} />

      {/* Dialogue box */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          padding: compact ? "14px 14px 16px" : "24px 28px 28px",
          background: "var(--surface-primary)",
          border: `2px solid ${SPEAKER_THEME[speaker].border}`,
          borderRadius: 12,
          backdropFilter: "blur(16px)",
          boxShadow: "var(--shadow-card)",
          minHeight: compact ? 72 : 90,
        }}
      >
        {/* Dialogue text */}
        <Text
          size={compact ? "sm" : "md"}
          lh={1.65}
          style={{
            color: "var(--text-primary)",
            fontFamily: "'Geist', sans-serif",
            letterSpacing: "0.2px",
            minHeight: compact ? "2.5em" : "3em",
          }}
        >
          {displayed}
          {/* Blinking cursor while typing */}
          {!isDone && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                background: "var(--text-primary)",
                opacity: 0.7,
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "vnCursor 0.6s step-end infinite",
              }}
            />
          )}
        </Text>

        {/* Advance indicator (mid-dialogue blinking chevron) */}
        {isDone && !isLastLine && <AdvanceIndicator />}

        {/* Bottom row: shortcut hint left, click to close right */}
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <Text
            className="tutor-hint-text"
            size="10px"
            style={{
              color: "rgba(160, 200, 255, 0.5)",
              letterSpacing: "0.3px",
              pointerEvents: "none",
            }}
          >
            Space / Enter &middot; Esc to dismiss
          </Text>
          {isDone && isLastLine && (
            <Text className="tutor-hint-text" size="10px" style={{ color: "rgba(160, 200, 255, 0.5)" }}>
              click to close
            </Text>
          )}
        </Box>
      </Box>

      <style>{`
        @keyframes vnCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
}