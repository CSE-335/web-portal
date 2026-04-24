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
import {
  streamEvent,
  buildFollowUpEvent,
  AssistantRequestError,
} from "./services/assistantApi";
import { loadConversation, saveConversation } from "./services/sessionStore";

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException || err instanceof Error) {
    return err.name === "AbortError";
  }
  return false;
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface GameSessionDefaults {
  gameId: string;
  levelId: string;
  targetConcept: string;
}

interface AssistantContextValue {
  state: AssistantState;
  dispatch: React.Dispatch<AssistantAction>;
  config: AssistantConfig;
  registerGameSession: (defaults: GameSessionDefaults) => void;
  unregisterGameSession: () => void;
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
  const sessionGameRef = useRef<GameSessionDefaults | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeGameIdRef = useRef<string>("general");

  const cancelInFlight = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "SET_GENERATING", payload: false });
  }, []);

  const registerGameSession = useCallback(
    (defaults: GameSessionDefaults) => {
      const nextGameId = defaults.gameId;
      const prevGameId = activeGameIdRef.current;

      sessionGameRef.current = defaults;
      activeGameIdRef.current = nextGameId;

      // If the game changed, cancel any in-flight stream and reset UI log.
      if (prevGameId !== nextGameId) {
        cancelInFlight();
        dispatch({ type: "RESET_CONVERSATION" });
        dispatch({ type: "CLOSE_PANEL" });
        dispatch({ type: "MINIMIZE" });
      }

      conversationRef.current = loadConversation(nextGameId);
    },
    [cancelInFlight],
  );

  const unregisterGameSession = useCallback(() => {
    sessionGameRef.current = null;
  }, []);

  const restoredRef = useRef(false);
  if (!restoredRef.current && typeof window !== "undefined") {
    conversationRef.current = loadConversation(activeGameIdRef.current);
    restoredRef.current = true;
  }

  const sendGameEvent = useCallback(
    (event: GameEvent) => {
      // New event means the previous in-flight response is no longer relevant.
      // `cancelInFlight` already clears the debounce timer + aborts the fetch.
      cancelInFlight();

      // Ensure we never reuse conversation across games.
      if (activeGameIdRef.current !== event.gameId) {
        activeGameIdRef.current = event.gameId;
        conversationRef.current = loadConversation(event.gameId);
        dispatch({ type: "RESET_CONVERSATION" });
        dispatch({ type: "CLOSE_PANEL" });
        dispatch({ type: "MINIMIZE" });
      }

      // Flip to the loading state synchronously so TTS stops and the UI shows
      // the "twins are discussing..." pill immediately, not after the debounce.
      lastEventRef.current = event;
      dispatch({ type: "START_STREAMING" });

      debounceRef.current = setTimeout(() => {
        abortRef.current = new AbortController();

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
              saveConversation(
                activeGameIdRef.current,
                conversationRef.current,
              );
            },
            onError(msg) {
              dispatch({ type: "SET_ERROR", payload: { message: msg } });
            },
          },
          abortRef.current.signal,
        ).catch((err) => {
          if (isAbortError(err)) return;
          if (err instanceof AssistantRequestError) {
            dispatch({
              type: "SET_ERROR",
              payload: {
                message: err.message,
                ...(err.cooldownUntilMs != null
                  ? { cooldownUntilMs: err.cooldownUntilMs }
                  : {}),
              },
            });
            return;
          }
          const msg = err instanceof Error ? err.message : "Network error";
          dispatch({ type: "SET_ERROR", payload: { message: msg } });
        });
      }, config.eventDebounceMs);
    },
    [
      config.apiEndpoint,
      config.maxLines,
      config.eventDebounceMs,
      cancelInFlight,
    ],
  );

  const sendUserMessage = useCallback(
    (text: string) => {
      const lastEvt = lastEventRef.current;
      const session = sessionGameRef.current;
      const inferredGameId = lastEvt?.gameId ?? session?.gameId ?? "general";
      if (activeGameIdRef.current !== inferredGameId) {
        activeGameIdRef.current = inferredGameId;
        conversationRef.current = loadConversation(inferredGameId);
        dispatch({ type: "RESET_CONVERSATION" });
        dispatch({ type: "CLOSE_PANEL" });
        dispatch({ type: "MINIMIZE" });
      }

      const userLine: DialogueLine = {
        speaker: "You",
        text,
        emotion: "idle",
      };

      conversationRef.current.push(userLine);
      saveConversation(activeGameIdRef.current, conversationRef.current);
      dispatch({ type: "ADD_USER_MESSAGE", payload: userLine });

      const event: GameEvent = {
        gameId: lastEvt?.gameId ?? session?.gameId ?? "general",
        levelId: lastEvt?.levelId ?? session?.levelId ?? "chat",
        eventType: "user_message",
        targetConcept: lastEvt?.targetConcept ?? session?.targetConcept ?? "general",
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
    cancelInFlight();
    dispatch({ type: "RESET_DIALOGUE" });
    dispatch({ type: "SET_ERROR", payload: { message: null } });
    dispatch({ type: "MINIMIZE" });
  }, [cancelInFlight]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      state,
      dispatch,
      config,
      registerGameSession,
      unregisterGameSession,
      sendGameEvent,
      sendUserMessage,
      requestFollowUp,
      advanceLine,
      dismissDialogue,
    }),
    [
      state,
      config,
      registerGameSession,
      unregisterGameSession,
      sendGameEvent,
      sendUserMessage,
      requestFollowUp,
      advanceLine,
      dismissDialogue,
    ],
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
