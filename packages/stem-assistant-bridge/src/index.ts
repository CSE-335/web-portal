/**
 * Shared bridge: embedded games → parent page (`GameIframeBridge` on the hub).
 * Protocol: `postMessage({ type: "ASSISTANT_GAME_EVENT", payload: GameEvent }, targetOrigin)`.
 */

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

const MESSAGE_TYPE = "ASSISTANT_GAME_EVENT" as const;

export interface StemAssistantBridgeOptions {
  /** Must match `game-id` / slug in the hub `games.ts`. */
  gameId: string;
  defaultLevelId?: string;
  defaultTargetConcept?: string;
  /**
   * Second argument to `postMessage`. Use `"*"` when the parent origin varies (dev/prod).
   * The hub still validates the iframe's origin when receiving.
   */
  targetOrigin?: string;
  /** Log when not embedded or when skipping (default false). */
  debug?: boolean;
}

interface BridgeState {
  gameId: string;
  levelId: string;
  targetConcept: string;
  hintCount: number;
  levelEpochMs: number;
  targetOrigin: string;
  debug: boolean;
}

let state: BridgeState | null = null;

function isEmbedded(): boolean {
  try {
    return window.parent !== window;
  } catch {
    return false;
  }
}

function log(state: BridgeState | null, ...args: unknown[]): void {
  if (state?.debug) console.debug("[stem-assistant-bridge]", ...args);
}

function secondsSinceLevelStart(): number {
  if (!state) return 0;
  return Math.max(0, Math.floor((Date.now() - state.levelEpochMs) / 1000));
}

/**
 * Call once at startup (e.g. main.ts). Optionally sends `level_start` when embedded.
 */
export function initStemAssistantBridge(
  options: StemAssistantBridgeOptions,
): void {
  const {
    gameId,
    defaultLevelId = "level_1",
    defaultTargetConcept,
    targetOrigin = "*",
    debug = false,
  } = options;

  state = {
    gameId,
    levelId: defaultLevelId,
    targetConcept:
      defaultTargetConcept?.trim() || gameId.replace(/-/g, "_"),
    hintCount: 0,
    levelEpochMs: Date.now(),
    targetOrigin,
    debug,
  };

  if (typeof window !== "undefined") {
    const w = window as Window & {
      stemAssistant?: typeof stemAssistant;
    };
    w.stemAssistant = stemAssistant;
  }

  if (isEmbedded()) {
    sendStemAssistantEvent({ eventType: "level_start" });
  } else {
    log(state, "Not in an iframe; events are no-ops until embedded in the hub.");
  }
}

/** Switch level / topic mid-session (resets level timer, not hint count). */
export function setStemAssistantLevel(
  levelId: string,
  targetConcept?: string,
): void {
  if (!state) {
    throw new Error("initStemAssistantBridge() must be called first.");
  }
  state.levelId = levelId;
  if (targetConcept !== undefined) {
    state.targetConcept = targetConcept;
  }
  state.levelEpochMs = Date.now();
}

/** Set hint count explicitly (or use `stemAssistant.hintRequest()` which increments). */
export function setStemAssistantHintCount(count: number): void {
  if (!state) {
    throw new Error("initStemAssistantBridge() must be called first.");
  }
  state.hintCount = Math.max(0, count);
}

function mergePayload(
  partial: Partial<GameEvent> & Pick<GameEvent, "eventType">,
): GameEvent {
  if (!state) {
    throw new Error("initStemAssistantBridge() must be called first.");
  }

  return {
    gameId: partial.gameId ?? state.gameId,
    levelId: partial.levelId ?? state.levelId,
    eventType: partial.eventType,
    targetConcept: partial.targetConcept ?? state.targetConcept,
    hintCount: partial.hintCount ?? state.hintCount,
    timeSpentSeconds:
      partial.timeSpentSeconds ?? secondsSinceLevelStart(),
    mistakeCategory: partial.mistakeCategory,
    playerAnswer: partial.playerAnswer,
    correctAnswer: partial.correctAnswer,
    additionalContext: partial.additionalContext,
  };
}

/**
 * Low-level send. Prefer `stemAssistant.*` helpers when possible.
 */
export function sendStemAssistantEvent(
  partial: Partial<GameEvent> & Pick<GameEvent, "eventType">,
): void {
  if (!state) {
    throw new Error("initStemAssistantBridge() must be called first.");
  }

  if (!isEmbedded()) {
    log(state, "skip (not embedded):", partial.eventType);
    return;
  }

  const payload = mergePayload(partial);
  window.parent.postMessage(
    { type: MESSAGE_TYPE, payload },
    state.targetOrigin,
  );
}

/** Convenience API */
export const stemAssistant = {
  levelStart(extra?: Partial<GameEvent>): void {
    if (state) state.levelEpochMs = Date.now();
    sendStemAssistantEvent({ eventType: "level_start", ...extra });
  },

  incorrect(extra?: Partial<GameEvent>): void {
    sendStemAssistantEvent({ eventType: "incorrect_submission", ...extra });
  },

  correct(extra?: Partial<GameEvent>): void {
    sendStemAssistantEvent({ eventType: "correct_submission", ...extra });
  },

  hintRequest(extra?: Partial<GameEvent>): void {
    if (state) {
      state.hintCount += 1;
    }
    sendStemAssistantEvent({
      eventType: "hint_request",
      hintCount: state?.hintCount ?? 0,
      ...extra,
    });
  },

  levelComplete(extra?: Partial<GameEvent>): void {
    sendStemAssistantEvent({ eventType: "level_complete", ...extra });
  },

  timeout(extra?: Partial<GameEvent>): void {
    sendStemAssistantEvent({ eventType: "timeout", ...extra });
  },

  recapRequest(extra?: Partial<GameEvent>): void {
    sendStemAssistantEvent({ eventType: "recap_request", ...extra });
  },
};
