// Context + hook
export { AssistantProvider, useAssistant } from "./AssistantContext";

// UI components
export { default as AssistantPanel } from "./AssistantPanel";
export { default as GameIframeBridge } from "./GameIframeBridge";
export { GameSessionRegistration } from "./GameSessionRegistration";

// Game hooks
export { useGameAssistant } from "./hooks/useGameAssistant";
export { useAssistantTTS } from "./hooks/useAssistantTTS";
export {
  useHoldToTalkSpeechRecognition,
  isBrowserSpeechRecognitionSupported,
} from "./hooks/useHoldToTalkSpeechRecognition";

// Icons (for use in game pages, e.g. "Ask Tutors" button)
export { TutorIcon } from "./components/icons";

// Services
export { streamEvent, buildFollowUpEvent } from "./services/assistantApi";
export { loadConversation, saveConversation } from "./services/sessionStore";

// Config (for overrides)
export { DEFAULT_CONFIG } from "./config";
export { ASSISTANT_UI_Z } from "./uiConstants";

// Mascot / VN layout (fluid sizing — tweak in one place)
export { MASCOT_VN_LAYOUT, MASCOT_PORTRAIT_FLUID_SIZE } from "./mascotLayout";

// Speaker theme
export { SPEAKER_THEME } from "./speakerTheme";
export type { SpeakerTheme } from "./speakerTheme";

// Per-game assistant integration (prompts, fallbacks, session defaults)
export {
  getAssistantGameIntegration,
  listAssistantGameSlugs,
} from "./gameIntegration";
export type { AssistantGameIntegration } from "./gameIntegration";

// Types
export type {
  AssistantConfig,
  AssistantState,
  AssistantAction,
  AssistantEventType,
  GameEvent,
  Speaker,
  MascotEmotion,
  DialogueLine,
  AssistantResponse,
  AssistantAPIRequest,
  AssistantAPIResponse,
  FollowUpAction,
} from "./types";