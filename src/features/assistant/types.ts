// ---------------------------------------------------------------------------
// Game → Assistant event payloads
// ---------------------------------------------------------------------------

export type AssistantEventType =
  | "incorrect_submission"
  | "correct_submission"
  | "hint_request"
  | "level_complete"
  | "level_start"
  | "timeout"
  | "recap_request"
  | "user_message";

export interface GameEvent {
  gameId: string;
  levelId: string;
  eventType: AssistantEventType;
  targetConcept: string;
  mistakeCategory?: string;
  playerAnswer?: string;
  correctAnswer?: string;
  hintCount: number;
  timeSpentSeconds: number;
  additionalContext?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Dialogue structures
// ---------------------------------------------------------------------------

export type Speaker = "Laurie" | "Livvy" | "You";

export type MascotEmotion =
  | "idle"
  | "speaking"
  | "happy"
  | "confused"
  | "surprised"
  | "thinking"
  | "encouraging";

export interface DialogueLine {
  speaker: Speaker;
  text: string;
  emotion?: MascotEmotion;
}

export interface FollowUpAction {
  label: string;
  actionType: "explain" | "hint" | "retry" | "skip" | "summarize";
}

export interface AssistantResponse {
  lines: DialogueLine[];
  summary: string;
  followUpActions?: FollowUpAction[];
}

// ---------------------------------------------------------------------------
// UI state
// ---------------------------------------------------------------------------

export interface AssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  isGenerating: boolean;
  currentDialogue: AssistantResponse | null;
  currentLineIndex: number;
  autoplayEnabled: boolean;
  voiceEnabled: boolean;
  history: AssistantResponse[];
  historyOpen: boolean;
  error: string | null;
  /** When set with a rate-limited assistant error, epoch ms when the limit window resets. */
  errorCooldownUntilMs: number | null;
  /** Non-fatal banner (e.g. TTS rate limit → browser fallback). */
  warning: string | null;
  /** Absolute time (ms) when server-indicated TTS cooldown ends; drives countdown in the banner. */
  warningCooldownUntilMs: number | null;
}

export type AssistantAction =
  | { type: "OPEN_PANEL" }
  | { type: "CLOSE_PANEL" }
  | { type: "MINIMIZE" }
  | { type: "MAXIMIZE" }
  | { type: "RESET_CONVERSATION" }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_DIALOGUE"; payload: AssistantResponse }
  | { type: "START_STREAMING" }
  | { type: "APPEND_LINES"; payload: DialogueLine[] }
  | { type: "FINISH_STREAMING"; payload: { summary: string } }
  | { type: "ADVANCE_LINE" }
  | { type: "RESET_DIALOGUE" }
  | { type: "TOGGLE_VOICE" }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "TOGGLE_HISTORY" }
  | {
      type: "SET_ERROR";
      payload: {
        message: string | null;
        cooldownUntilMs?: number | null;
      };
    }
  | {
      type: "SET_ASSISTANT_WARNING";
      payload: {
        message: string | null;
        cooldownUntilMs?: number | null;
      };
    }
  | { type: "ADD_USER_MESSAGE"; payload: DialogueLine };

// ---------------------------------------------------------------------------
// API request / response
// ---------------------------------------------------------------------------

export interface AssistantAPIRequest {
  event: GameEvent;
  conversationHistory?: DialogueLine[];
  maxLines?: number;
}

export interface AssistantAPIResponse {
  success: boolean;
  data?: AssistantResponse;
  error?: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface AssistantConfig {
  apiEndpoint: string;
  maxLines: number;
  eventDebounceMs: number;
  /** Base path for mascot expression images (default: "/images/mascots") */
  mascotAssetPath: string;
  /** File extension for mascot images (default: "png") */
  mascotAssetExtension: string;
  /** Milliseconds per dialogue line in autoplay (default: 2800) */
  autoAdvanceMs: number;
}