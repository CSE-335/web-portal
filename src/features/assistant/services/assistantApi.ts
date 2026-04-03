import { parsePartialJson } from "ai";
import type {
  GameEvent,
  DialogueLine,
  AssistantAPIResponse,
} from "../types";

// ---------------------------------------------------------------------------
// Stream callbacks
// ---------------------------------------------------------------------------

interface StreamCallbacks {
  onLines: (newLines: DialogueLine[]) => void;
  onFinish: (summary: string, allLines: DialogueLine[]) => void;
  onError: (error: string) => void;
}

function isCompleteLine(l: unknown): l is DialogueLine {
  if (!l || typeof l !== "object") return false;
  const obj = l as Record<string, unknown>;
  return (
    typeof obj.speaker === "string" &&
    typeof obj.text === "string" &&
    typeof obj.emotion === "string"
  );
}

// ---------------------------------------------------------------------------
// Streaming event sender (AI SDK data stream protocol)
// ---------------------------------------------------------------------------

export async function streamEvent(
  apiEndpoint: string,
  event: GameEvent,
  conversationHistory: DialogueLine[],
  maxLines: number,
  callbacks: StreamCallbacks,
): Promise<void> {
  const res = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      conversationHistory: conversationHistory.slice(-12),
      maxLines,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      (errBody as { error?: string }).error || `API returned ${res.status}`,
    );
  }

  const contentType = res.headers.get("content-type") || "";

  // Non-streaming JSON response (static fallback when no API key is set)
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as AssistantAPIResponse;
    if (json.success && json.data) {
      callbacks.onLines(json.data.lines);
      callbacks.onFinish(json.data.summary, json.data.lines);
      return;
    }
    throw new Error(json.error || "Unknown error");
  }

  // Streaming response — toTextStreamResponse sends raw partial JSON text
  if (!res.body) throw new Error("Response has no body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let emittedCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    accumulated += decoder.decode(value, { stream: true });

    const { value: partial } = await parsePartialJson(accumulated);
    if (partial && typeof partial === "object" && "lines" in partial) {
      const arr = (partial as { lines?: unknown[] }).lines ?? [];
      const complete = arr.filter(isCompleteLine);

      if (complete.length > emittedCount) {
        callbacks.onLines(complete.slice(emittedCount));
        emittedCount = complete.length;
      }
    }
  }

  // Final parse for any remaining lines and the summary
  const { value: final } = await parsePartialJson(accumulated);
  if (final && typeof final === "object") {
    const obj = final as Record<string, unknown>;
    const allLines = ((obj.lines ?? []) as unknown[]).filter(isCompleteLine);
    const summary = typeof obj.summary === "string" ? obj.summary : "";

    if (allLines.length > emittedCount) {
      callbacks.onLines(allLines.slice(emittedCount));
    }

    callbacks.onFinish(summary, allLines);
  } else {
    callbacks.onFinish("", []);
  }
}

// ---------------------------------------------------------------------------
// Follow-up event builder (unchanged)
// ---------------------------------------------------------------------------

export function buildFollowUpEvent(
  lastEvent: GameEvent,
  actionType: string,
  recentHistory: DialogueLine[],
): GameEvent {
  return {
    ...lastEvent,
    eventType:
      actionType === "hint"
        ? "hint_request"
        : actionType === "summarize"
          ? "recap_request"
          : lastEvent.eventType,
    additionalContext: {
      ...lastEvent.additionalContext,
      followUpType: actionType,
      priorDialogue: recentHistory.slice(-6),
    },
  };
}
