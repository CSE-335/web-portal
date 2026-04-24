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
  isAudioBuffering: false,
  currentDialogue: null,
  currentLineIndex: 0,
  autoplayEnabled: false,
  voiceEnabled: true,
  history: [],
  historyOpen: false,
  error: null,
  errorCooldownUntilMs: null,
  warning: null,
  warningCooldownUntilMs: null,
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
        isAudioBuffering: false,
        currentDialogue: null,
        currentLineIndex: 0,
        history: [],
        historyOpen: false,
        error: null,
        errorCooldownUntilMs: null,
        warning: null,
        warningCooldownUntilMs: null,
      };

    case "SET_GENERATING":
      return {
        ...state,
        isGenerating: action.payload,
        // Stopping generation should also clear any pending audio-buffer flag.
        isAudioBuffering: action.payload ? state.isAudioBuffering : false,
        error: null,
        errorCooldownUntilMs: null,
      };

    case "SET_AUDIO_BUFFERING":
      return { ...state, isAudioBuffering: action.payload };

    case "SET_DIALOGUE":
      return {
        ...state,
        currentDialogue: action.payload,
        currentLineIndex: 0,
        isGenerating: false,
        isAudioBuffering: false,
        history: [...state.history, action.payload],
      };

    case "START_STREAMING":
      return {
        ...state,
        isGenerating: true,
        // Preemptively buffer audio when voice is on so the dialogue overlay does
        // not flash in for one render before the TTS hook has a chance to react.
        isAudioBuffering: state.voiceEnabled,
        currentDialogue: { lines: [], summary: "" },
        currentLineIndex: 0,
        error: null,
        errorCooldownUntilMs: null,
        warning: null,
        warningCooldownUntilMs: null,
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
      return {
        ...state,
        isAudioBuffering: false,
        currentDialogue: null,
        currentLineIndex: 0,
        warning: null,
        warningCooldownUntilMs: null,
      };

    case "TOGGLE_VOICE": {
      const nextVoiceEnabled = !state.voiceEnabled;
      return {
        ...state,
        voiceEnabled: nextVoiceEnabled,
        // Turning voice off mid-buffer must release the loader; turning it on
        // does not retroactively add latency to an already-visible dialogue.
        isAudioBuffering: nextVoiceEnabled ? state.isAudioBuffering : false,
      };
    }

    case "TOGGLE_AUTOPLAY":
      return { ...state, autoplayEnabled: !state.autoplayEnabled };

    case "TOGGLE_HISTORY":
      return { ...state, historyOpen: !state.historyOpen };

    case "SET_ERROR": {
      const { message, cooldownUntilMs } = action.payload;
      return {
        ...state,
        error: message,
        errorCooldownUntilMs:
          message === null
            ? null
            : cooldownUntilMs === undefined
              ? null
              : cooldownUntilMs,
        isGenerating: false,
        isAudioBuffering: false,
        currentDialogue: null,
        currentLineIndex: 0,
        warning: null,
        warningCooldownUntilMs: null,
      };
    }

    case "SET_ASSISTANT_WARNING": {
      const { message, cooldownUntilMs } = action.payload;
      return {
        ...state,
        warning: message,
        warningCooldownUntilMs:
          message === null
            ? null
            : cooldownUntilMs === undefined
              ? null
              : cooldownUntilMs,
      };
    }

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