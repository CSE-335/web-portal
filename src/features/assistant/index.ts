// Context + hook
export { AssistantProvider, useAssistant } from "./AssistantContext";

// UI components
export { default as AssistantPanel } from "./AssistantPanel";
export { default as GameIframeBridge } from "./GameIframeBridge";

// Game hooks
export { useGameAssistant } from "./hooks/useGameAssistant";
export { useAssistantTTS } from "./hooks/useAssistantTTS";

// Icons (for use in game pages, e.g. "Ask Tutors" button)
export { TutorIcon } from "./components/icons";

// Services
export { streamEvent, buildFollowUpEvent } from "./services/assistantApi";
export { loadConversation, saveConversation } from "./services/sessionStore";

// Config (for overrides)
export { DEFAULT_CONFIG } from "./config";

// Mascot / VN layout (fluid sizing — tweak in one place)
export { MASCOT_VN_LAYOUT, MASCOT_PORTRAIT_FLUID_SIZE } from "./mascotLayout";

// Speaker theme
export { SPEAKER_THEME } from "./speakerTheme";
export type { SpeakerTheme } from "./speakerTheme";

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