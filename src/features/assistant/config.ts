// ============================================================================
// Default configuration and pure reducer. No React, no side effects.
// ============================================================================

import type { AssistantConfig, AssistantState, AssistantAction } from "./types";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_CONFIG: AssistantConfig = {
  apiEndpoint: "/api/assistant",
  maxLines: 6,
  eventDebounceMs: 500,
  mascotAssetPath: "/images/mascots",
  mascotAssetExtension: "png",
  autoAdvanceMs: 2800,
};

export const INITIAL_STATE: AssistantState = {
  isOpen: false,
  isMinimized: true,
  isGenerating: false,
  currentDialogue: null,
  currentLineIndex: 0,
  autoplayEnabled: false,
  voiceEnabled: true,
  history: [],
  historyOpen: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer — pure function, no React dependency
// ---------------------------------------------------------------------------

export function assistantReducer(
  state: AssistantState,
  action: AssistantAction
): AssistantState {
  switch (action.type) {
    case "OPEN_PANEL":
      return { ...state, isOpen: true, isMinimized: false };

    case "CLOSE_PANEL":
      return { ...state, isOpen: false };

    case "MINIMIZE":
      return { ...state, isMinimized: true };

    case "MAXIMIZE":
      return { ...state, isMinimized: false };

    case "RESET_CONVERSATION":
      return {
        ...state,
        isGenerating: false,
        currentDialogue: null,
        currentLineIndex: 0,
        history: [],
        historyOpen: false,
        error: null,
      };

    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload, error: null };

    case "SET_DIALOGUE":
      return {
        ...state,
        currentDialogue: action.payload,
        currentLineIndex: 0,
        isGenerating: false,
        isOpen: true,
        isMinimized: false,
        history: [...state.history, action.payload],
      };

    case "START_STREAMING":
      return {
        ...state,
        isGenerating: true,
        isOpen: true,
        isMinimized: false,
        currentDialogue: { lines: [], summary: "" },
        currentLineIndex: 0,
        error: null,
      };

    case "APPEND_LINES": {
      const prev = state.currentDialogue ?? { lines: [], summary: "" };
      return {
        ...state,
        currentDialogue: {
          ...prev,
          lines: [...prev.lines, ...action.payload],
        },
      };
    }

    case "FINISH_STREAMING": {
      const dialogue = state.currentDialogue ?? { lines: [], summary: "" };
      const finished = { ...dialogue, summary: action.payload.summary };
      return {
        ...state,
        isGenerating: false,
        currentDialogue: finished,
        history: [...state.history, finished],
      };
    }

    case "ADVANCE_LINE":
      return {
        ...state,
        currentLineIndex: Math.min(
          state.currentLineIndex + 1,
          (state.currentDialogue?.lines.length ?? 1) - 1
        ),
      };

    case "RESET_DIALOGUE":
      return { ...state, currentDialogue: null, currentLineIndex: 0 };

    case "TOGGLE_VOICE":
      return { ...state, voiceEnabled: !state.voiceEnabled };

    case "TOGGLE_AUTOPLAY":
      return { ...state, autoplayEnabled: !state.autoplayEnabled };

    case "TOGGLE_HISTORY":
      return { ...state, historyOpen: !state.historyOpen };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isGenerating: false,
        currentDialogue: null,
        currentLineIndex: 0,
      };

    case "ADD_USER_MESSAGE":
      return {
        ...state,
        history: [
          ...state.history,
          { lines: [action.payload], summary: "" },
        ],
      };

    default:
      return state;
  }
}