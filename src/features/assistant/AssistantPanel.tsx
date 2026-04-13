// ============================================================================
// Visual novel-style presentation.
// Sprites + dialogue overlay ONLY appear when there's active dialogue.
// When idle, nothing blocks the game.
// ============================================================================

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Alert, Box, Transition } from "@mantine/core";
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
  // - "isOpen" = the player hasn't explicitly closed the assistant
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

  if (
    !showOverlay &&
    !showPill &&
    !state.isGenerating &&
    !showChatOnly &&
    !showErrorBanner
  )
    return null;

  // Figure out who's currently speaking
  const currentLine = state.currentDialogue?.lines[state.currentLineIndex];
  const activeSpeaker = currentLine?.speaker ?? null;
  const activeEmotion = currentLine?.emotion ?? "idle";

  return (
    <>
      {showErrorBanner && (
        <Box
          style={{
            position: "fixed",
            bottom: showOverlay || showChatOnly ? 120 : 20,
            left: 16,
            right: 16,
            zIndex: 1001,
            pointerEvents: "auto",
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <Alert
            color="red"
            variant="light"
            withCloseButton
            onClose={() => dispatch({ type: "SET_ERROR", payload: null })}
          >
            {state.error}
          </Alert>
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