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
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  const skipToEnd = useCallback(() => {
    setDisplayed(text);
    setIsDone(true);
  }, [text]);

  return { displayed, isDone, skipToEnd };
}

// ---------------------------------------------------------------------------
// Speaker name plate
// ---------------------------------------------------------------------------

function NamePlate({ speaker }: { speaker: Speaker }) {
  const c = SPEAKER_THEME[speaker];

  return (
    <Box
      style={{
        position: "absolute",
        top: -16,
        left: speaker === "Laurie" ? 20 : "auto",
        right: speaker === "Livvy" ? 20 : "auto",
        background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
        padding: "4px 20px",
        borderRadius: "8px 8px 0 0",
        boxShadow: `0 -4px 16px ${c.glow}`,
        zIndex: 2,
      }}
    >
      <Text size="sm" fw={700} c="white" style={{ letterSpacing: "0.5px" }}>
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

export default function VNDialogueBox() {
  const { state, advanceLine, dismissDialogue } = useAssistant();
  const dialogue = state.currentDialogue;

  // Current line being displayed
  const currentLine = dialogue?.lines[state.currentLineIndex];
  const isLastLine =
    dialogue != null && state.currentLineIndex >= dialogue.lines.length - 1;

  // Typewriter effect
  const { displayed, isDone, skipToEnd } = useTypewriter(
    currentLine?.text ?? "",
    20
  );

  // Click handler: if typing → skip to end, if done → advance or dismiss
  const handleClick = useCallback(() => {
    if (!isDone) {
      skipToEnd();
    } else if (isLastLine) {
      dismissDialogue();
    } else {
      advanceLine();
    }
  }, [isDone, isLastLine, skipToEnd, advanceLine, dismissDialogue]);

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

  // Loading state — either no dialogue yet, or streaming started with 0 lines
  if (state.isGenerating && (!dialogue || dialogue.lines.length === 0)) {
    return (
      <Box
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
          padding: "24px 28px",
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
      }}
    >
      {/* Name plate */}
      <NamePlate speaker={speaker} />

      {/* Dialogue box */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          padding: "24px 28px 28px",
          background: "var(--surface-primary)",
          border: `2px solid ${SPEAKER_THEME[speaker].border}`,
          borderRadius: 12,
          backdropFilter: "blur(16px)",
          boxShadow: "var(--shadow-card)",
          minHeight: 90,
        }}
      >
        {/* Dialogue text */}
        <Text
          size="md"
          lh={1.7}
          style={{
            color: "var(--text-primary)",
            fontFamily: "'Geist', sans-serif",
            letterSpacing: "0.2px",
            minHeight: "3em",
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

        {/* Summary (shown on last line after typing finishes) */}
        {isLastLine && isDone && dialogue.summary && (
          <Text size="xs" c="dimmed" fs="italic" mt="sm">
            {dialogue.summary}
          </Text>
        )}

        {/* Advance indicator */}
        {isDone && !isLastLine && <AdvanceIndicator />}

        {/* Advance indicator */}
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