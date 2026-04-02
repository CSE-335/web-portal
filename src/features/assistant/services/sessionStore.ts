import type { DialogueLine } from "../types";

const STORAGE_KEY = "assistant_conversation";
const MAX_STORED_LINES = 50;

export function loadConversation(): DialogueLine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as DialogueLine[]) : [];
  } catch {
    return [];
  }
}

export function saveConversation(lines: DialogueLine[]): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lines.slice(-MAX_STORED_LINES))
    );
  } catch { /* storage full or unavailable */ }
}
