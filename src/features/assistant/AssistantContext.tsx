// ============================================================================
// React context + provider. Thin orchestration layer — delegates HTTP and
// persistence to services/.
// ============================================================================

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type {
  AssistantState,
  AssistantAction,
  AssistantConfig,
  GameEvent,
  DialogueLine,
} from "./types";
import { DEFAULT_CONFIG, INITIAL_STATE, assistantReducer } from "./config";
import { streamEvent, buildFollowUpEvent } from "./services/assistantApi";
import { loadConversation, saveConversation } from "./services/sessionStore";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AssistantContextValue {
  state: AssistantState;
  dispatch: React.Dispatch<AssistantAction>;
  config: AssistantConfig;
  sendGameEvent: (event: GameEvent) => void;
  sendUserMessage: (text: string) => void;
  requestFollowUp: (actionType: string) => void;
  advanceLine: () => void;
  dismissDialogue: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AssistantProviderProps {
  children: ReactNode;
  config?: Partial<AssistantConfig>;
}

export function AssistantProvider({
  children,
  config: overrides,
}: AssistantProviderProps) {
  const [state, dispatch] = useReducer(assistantReducer, INITIAL_STATE);
  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...overrides }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(overrides)]
  );

  const conversationRef = useRef<DialogueLine[]>([]);
  const lastEventRef = useRef<GameEvent | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restoredRef = useRef(false);
  if (!restoredRef.current && typeof window !== "undefined") {
    conversationRef.current = loadConversation();
    restoredRef.current = true;
  }

  const sendGameEvent = useCallback(
    (event: GameEvent) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        dispatch({ type: "START_STREAMING" });
        lastEventRef.current = event;

        streamEvent(
          config.apiEndpoint,
          event,
          conversationRef.current,
          config.maxLines,
          {
            onLines(newLines) {
              dispatch({ type: "APPEND_LINES", payload: newLines });
            },
            onFinish(summary, allLines) {
              dispatch({ type: "FINISH_STREAMING", payload: { summary } });
              conversationRef.current.push(...allLines);
              saveConversation(conversationRef.current);
            },
            onError(msg) {
              dispatch({ type: "SET_ERROR", payload: msg });
            },
          },
        ).catch((err) => {
          const msg = err instanceof Error ? err.message : "Network error";
          dispatch({ type: "SET_ERROR", payload: msg });
        });
      }, config.eventDebounceMs);
    },
    [config.apiEndpoint, config.maxLines, config.eventDebounceMs],
  );

  const sendUserMessage = useCallback(
    (text: string) => {
      const userLine: DialogueLine = {
        speaker: "You",
        text,
        emotion: "idle",
      };

      conversationRef.current.push(userLine);
      saveConversation(conversationRef.current);
      dispatch({ type: "ADD_USER_MESSAGE", payload: userLine });

      const lastEvt = lastEventRef.current;
      const event: GameEvent = {
        gameId: lastEvt?.gameId ?? "general",
        levelId: lastEvt?.levelId ?? "chat",
        eventType: "user_message",
        targetConcept: lastEvt?.targetConcept ?? "general",
        hintCount: 0,
        timeSpentSeconds: 0,
        additionalContext: { userMessage: text },
      };

      sendGameEvent(event);
    },
    [sendGameEvent],
  );

  const requestFollowUp = useCallback(
    (actionType: string) => {
      if (!lastEventRef.current) return;
      const followUp = buildFollowUpEvent(
        lastEventRef.current,
        actionType,
        conversationRef.current,
      );
      sendGameEvent(followUp);
    },
    [sendGameEvent],
  );

  const advanceLine = useCallback(() => dispatch({ type: "ADVANCE_LINE" }), []);
  const dismissDialogue = useCallback(() => {
    dispatch({ type: "RESET_DIALOGUE" });
    dispatch({ type: "CLOSE_PANEL" });
  }, []);

  const value = useMemo<AssistantContextValue>(
    () => ({
      state,
      dispatch,
      config,
      sendGameEvent,
      sendUserMessage,
      requestFollowUp,
      advanceLine,
      dismissDialogue,
    }),
    [state, config, sendGameEvent, sendUserMessage, requestFollowUp, advanceLine, dismissDialogue],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within <AssistantProvider>");
  }
  return ctx;
}
