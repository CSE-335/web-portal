import type { DialogueLine } from "../types";

const STORAGE_KEY = "assistant_conversation";
const MAX_STORED_LINES = 50;

type ConversationStoreV2 = Record<string, DialogueLine[]>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function normalizeGameId(gameId: string | undefined): string {
  const g = (gameId ?? "").trim();
  return g.length > 0 ? g : "general";
}

/**
 * Loads conversation history for a specific game. Data is stored per-gameId to
 * prevent cross-game context bleed.
 *
 * Migration: if the stored value is the legacy array format, it is treated as
 * the "general" conversation and upgraded to the new object format.
 */
export function loadConversation(gameId?: string): DialogueLine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved) as unknown;
    const key = normalizeGameId(gameId);

    // Legacy format: DialogueLine[]
    if (Array.isArray(parsed)) {
      const legacyLines = parsed as DialogueLine[];
      const upgraded: ConversationStoreV2 = { general: legacyLines };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
      return key === "general" ? legacyLines : [];
    }

    // V2 format: { [gameId]: DialogueLine[] }
    if (isRecord(parsed)) {
      const store = parsed as ConversationStoreV2;
      const lines = store[key];
      return Array.isArray(lines) ? (lines as DialogueLine[]) : [];
    }

    return [];
  } catch {
    return [];
  }
}

export function saveConversation(gameId: string | undefined, lines: DialogueLine[]): void {
  if (typeof window === "undefined") return;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown) : undefined;

    const key = normalizeGameId(gameId);
    const clipped = lines.slice(-MAX_STORED_LINES);

    // If existing is legacy array, upgrade first.
    if (Array.isArray(parsed)) {
      const upgraded: ConversationStoreV2 = { general: parsed as DialogueLine[] };
      upgraded[key] = clipped;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
      return;
    }

    const store: ConversationStoreV2 = isRecord(parsed)
      ? (parsed as ConversationStoreV2)
      : {};
    store[key] = clipped;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or unavailable */
  }
}
