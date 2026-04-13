// ============================================================================
// Visual novel-style presentation.
// Sprites + dialogue overlay ONLY appear when there's active dialogue.
// When idle, nothing blocks the game.
// ============================================================================

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert, Box, Text, Transition } from "@mantine/core";
import { useAssistant } from "./AssistantContext";
import { MASCOT_VN_LAYOUT } from "./mascotLayout";
import { useAutoAdvance } from "./hooks/useAutoAdvance";
import { useAssistantTTS } from "./hooks/useAssistantTTS";
import VNSprite from "./components/VNSprite";
import VNDialogueBox from "./components/VNDialogueBox";
import VNActionBar from "./components/VNActionBar";
import DialogueHistory from "./components/DialogueHistory";
import ChatInput from "./components/ChatInput";
import MinimizedPill from "./components/MinimizedPill";

/** Updates once per second while `untilMs` is set so the banner can show a live countdown. */
function useSecondsRemainingUntil(untilMs: number | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (untilMs == null) {
      const clearId = requestAnimationFrame(() => setRemaining(null));
      return () => cancelAnimationFrame(clearId);
    }

    const tick = () => {
      setRemaining(
        Math.max(0, Math.ceil((untilMs - Date.now()) / 1000)),
      );
    };

    const firstId = requestAnimationFrame(tick);
    const intervalId = window.setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(firstId);
      window.clearInterval(intervalId);
    };
  }, [untilMs]);

  return untilMs == null ? null : remaining;
}

export default function AssistantPanel() {
  const { state, dismissDialogue, dispatch } = useAssistant();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useAutoAdvance();
  const { stop } = useAssistantTTS();

  // Reset assistant state and stop TTS when the route changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      stop();
      dismissDialogue();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, stop, dismissDialogue]);

  // Key distinction:
  // - "isOpen" = the player opened the tutor via the toolbar (game events no longer auto-open)
  // - "hasDialogue" = there's actual content to display
  // The VN overlay only shows when BOTH are true.
  // The chat input shows whenever the panel is open (even without dialogue).
  const hasDialogue =
    state.currentDialogue !== null && state.currentDialogue.lines.length > 0;
  const showOverlay = state.isOpen && !state.isMinimized && hasDialogue;
  const showPill = state.isOpen && state.isMinimized && hasDialogue;
  const showChatOnly =
    state.isOpen && !state.isMinimized && !hasDialogue && !state.isGenerating;
  const showErrorBanner = Boolean(state.error);
  const showWarningBanner = Boolean(state.warning);
  const voiceCooldownSeconds = useSecondsRemainingUntil(
    state.warningCooldownUntilMs,
  );
  const assistantCooldownSeconds = useSecondsRemainingUntil(
    state.errorCooldownUntilMs,
  );

  const toastMaxWidth = "min(340px, calc(100vw - 40px))";
  const toastStackBottom = showPill ? 96 : 22;

  if (
    !showOverlay &&
    !showPill &&
    !(state.isGenerating && state.isOpen) &&
    !showChatOnly &&
    !showErrorBanner
    && !showWarningBanner
  )
    return null;

  // Figure out who's currently speaking
  const currentLine = state.currentDialogue?.lines[state.currentLineIndex];
  const activeSpeaker = currentLine?.speaker ?? null;
  const activeEmotion = currentLine?.emotion ?? "idle";

  return (
    <>
      {(showErrorBanner || showWarningBanner) && (
        <Box
          style={{
            position: "fixed",
            bottom: toastStackBottom,
            right: 20,
            left: "auto",
            zIndex: 1002,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
            maxWidth: toastMaxWidth,
            width: toastMaxWidth,
          }}
        >
          {showErrorBanner && (
            <Alert
              color="red"
              variant="light"
              withCloseButton
              onClose={() =>
                dispatch({ type: "SET_ERROR", payload: { message: null } })
              }
              styles={{ root: { width: "100%" } }}
            >
              {state.error}
              {assistantCooldownSeconds != null
                && assistantCooldownSeconds > 0 && (
                <Text size="sm" mt={8} c="dimmed">
                  Try again in {assistantCooldownSeconds}s
                </Text>
              )}
              {assistantCooldownSeconds === 0
                && state.errorCooldownUntilMs != null && (
                <Text size="sm" mt={8} c="dimmed">
                  You can send another message now.
                </Text>
              )}
            </Alert>
          )}

          {showWarningBanner && (
            <Alert
              color="yellow"
              variant="light"
              title="Voice"
              withCloseButton
              onClose={() =>
                dispatch({
                  type: "SET_ASSISTANT_WARNING",
                  payload: { message: null },
                })
              }
              styles={{ root: { width: "100%" } }}
            >
              {state.warning}
              {voiceCooldownSeconds != null && voiceCooldownSeconds > 0 && (
                <Text size="sm" mt={8} c="dimmed">
                  Cloud voice quota resets in {voiceCooldownSeconds}s
                </Text>
              )}
              {voiceCooldownSeconds === 0
                && state.warningCooldownUntilMs != null && (
                <Text size="sm" mt={8} c="dimmed">
                  Cloud voice should be available again; new lines will try it
                  automatically.
                </Text>
              )}
            </Alert>
          )}
        </Box>
      )}

      {/* Minimized pill */}
      <Transition mounted={showPill} transition="slide-up" duration={300}>
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            <MinimizedPill />
          </Box>
        )}
      </Transition>

      {/* Loading indicator (no overlay, just a small pill) */}
      {state.isGenerating && !hasDialogue && state.isOpen && (
        <Box
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <VNDialogueBox />
        </Box>
      )}

      {/* Full VN overlay — ONLY when dialogue exists */}
      <Transition mounted={showOverlay} transition="fade" duration={400}>
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "fixed",
              inset: 0,
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            {/* Backdrop — visual only, does not dismiss on click */}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, var(--surface-primary) 0%, color-mix(in srgb, var(--surface-primary) 30%, transparent) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Sprites — left and right, no pointer events */}
            <Box
              style={{
                position: "absolute",
                bottom: MASCOT_VN_LAYOUT.stageBottom,
                left: 0,
                right: 0,
                height: MASCOT_VN_LAYOUT.stageHeight,
                pointerEvents: "none",
              }}
            >
              <VNSprite
                speaker="Laurie"
                emotion={activeSpeaker === "Laurie" ? activeEmotion : "idle"}
                isActive={activeSpeaker === "Laurie"}
              />
              <VNSprite
                speaker="Livvy"
                emotion={activeSpeaker === "Livvy" ? activeEmotion : "idle"}
                isActive={activeSpeaker === "Livvy"}
              />
            </Box>

            {/* Dialogue box + actions + chat input — anchored at bottom */}
            <Box
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                bottom: 20,
                left: 16,
                right: 16,
                pointerEvents: "auto",
              }}
            >
              <DialogueHistory />
              <VNDialogueBox />
              <VNActionBar />
              <ChatInput />
            </Box>
          </Box>
        )}
      </Transition>

      {/* Chat-only mode — no dialogue active, but panel is open */}
      {showChatOnly && (
        <Box
          style={{
            position: "fixed",
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <DialogueHistory />
          <ChatInput />
        </Box>
      )}
    </>
  );
}