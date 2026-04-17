// ============================================================================
// Hook for games built directly in Next.js (not iframe-hosted).
// Wraps context with typed convenience methods.
// ============================================================================

"use client";

import { useCallback, useMemo } from "react";
import { useAssistant } from "../AssistantContext";
import type { GameEvent, AssistantEventType } from "../types";

interface GameAssistantOptions {
  gameId: string;
  levelId: string;
  targetConcept: string;
}

export function useGameAssistant(options: GameAssistantOptions) {
  const { sendGameEvent, sendUserMessage, dismissDialogue, state, dispatch } = useAssistant();
  const { gameId, levelId, targetConcept } = options;

  const buildEvent = useCallback(
    (type: AssistantEventType, overrides?: Partial<GameEvent>): GameEvent => ({
      gameId,
      levelId,
      eventType: type,
      targetConcept,
      hintCount: 0,
      timeSpentSeconds: 0,
      ...overrides,
    }),
    [gameId, levelId, targetConcept]
  );

  const reportIncorrect = useCallback(
    (p: {
      playerAnswer: string;
      correctAnswer: string;
      mistakeCategory?: string;
      hintCount?: number;
      timeSpentSeconds?: number;
    }) =>
      sendGameEvent(
        buildEvent("incorrect_submission", {
          playerAnswer: p.playerAnswer,
          correctAnswer: p.correctAnswer,
          mistakeCategory: p.mistakeCategory,
          hintCount: p.hintCount ?? 0,
          timeSpentSeconds: p.timeSpentSeconds ?? 0,
        })
      ),
    [sendGameEvent, buildEvent]
  );

  const reportCorrect = useCallback(
    (p?: { playerAnswer?: string; timeSpentSeconds?: number }) =>
      sendGameEvent(
        buildEvent("correct_submission", {
          playerAnswer: p?.playerAnswer,
          timeSpentSeconds: p?.timeSpentSeconds ?? 0,
        })
      ),
    [sendGameEvent, buildEvent]
  );

  const requestHint = useCallback(
    (p?: { hintCount?: number; timeSpentSeconds?: number }) =>
      sendGameEvent(
        buildEvent("hint_request", {
          hintCount: p?.hintCount ?? 0,
          timeSpentSeconds: p?.timeSpentSeconds ?? 0,
        })
      ),
    [sendGameEvent, buildEvent]
  );

  const reportLevelComplete = useCallback(
    (p?: { timeSpentSeconds?: number }) =>
      sendGameEvent(
        buildEvent("level_complete", {
          timeSpentSeconds: p?.timeSpentSeconds ?? 0,
        })
      ),
    [sendGameEvent, buildEvent]
  );

  const reportLevelStart = useCallback(
    () => sendGameEvent(buildEvent("level_start")),
    [sendGameEvent, buildEvent]
  );

  const reportTimeout = useCallback(
    (p?: { playerAnswer?: string; correctAnswer?: string }) =>
      sendGameEvent(buildEvent("timeout", p)),
    [sendGameEvent, buildEvent]
  );

  const requestRecap = useCallback(
    () => sendGameEvent(buildEvent("recap_request")),
    [sendGameEvent, buildEvent]
  );

  const sendMessage = useCallback(
    (text: string) => sendUserMessage(text),
    [sendUserMessage]
  );

  return useMemo(
    () => ({
      reportIncorrect,
      reportCorrect,
      requestHint,
      reportLevelComplete,
      reportLevelStart,
      reportTimeout,
      requestRecap,
      sendMessage,
      isGenerating: state.isGenerating,
      isOpen: state.isOpen,
      open: () => dispatch({ type: "OPEN_PANEL" }),
      close: () => dispatch({ type: "CLOSE_PANEL" }),
      dismiss: dismissDialogue,
    }),
    [
      reportIncorrect, reportCorrect, requestHint,
      reportLevelComplete, reportLevelStart, reportTimeout,
      requestRecap, sendMessage, state.isGenerating, state.isOpen,
      dispatch, dismissDialogue,
    ]
  );
}