"use client";

// Games embed the `stem-assistant-bridge` package to emit ASSISTANT_GAME_EVENT payloads.

import { useEffect, useMemo } from "react";
import { useAssistant } from "./AssistantContext";
import type { GameEvent } from "./types";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://atalania.github.io",
  "http://localhost:3000",
  "http://localhost:5000",
];

interface GamePostMessage {
  type: "ASSISTANT_GAME_EVENT";
  payload: GameEvent;
}

interface GameIframeBridgeProps {
  gameFilter?: string;
  allowedOrigins?: string[];
}

function normalizeAllowedOrigins(extraOrigins?: string[]): Set<string> {
  const originSet = new Set<string>(DEFAULT_ALLOWED_ORIGINS);
  for (const origin of extraOrigins ?? []) {
    const trimmed = origin.trim();
    if (trimmed) originSet.add(trimmed);
  }
  return originSet;
}

function isGamePostMessage(data: unknown): data is GamePostMessage {
  if (!data || typeof data !== "object") return false;

  const rec = data as Record<string, unknown>;
  if (rec.type !== "ASSISTANT_GAME_EVENT") return false;

  const payload = rec.payload as Record<string, unknown> | undefined;
  if (!payload || typeof payload !== "object") return false;

  return (
    typeof payload.gameId === "string" &&
    payload.gameId.length > 0 &&
    typeof payload.eventType === "string" &&
    payload.eventType.length > 0
  );
}

export default function GameIframeBridge({
  gameFilter,
  allowedOrigins,
}: GameIframeBridgeProps) {
  const { sendGameEvent } = useAssistant();

  const allowedOriginsKey = useMemo(() => {
    if (!allowedOrigins?.length) return "";
    return [...allowedOrigins].map((o) => o.trim()).filter(Boolean).sort().join("|");
  }, [allowedOrigins]);

  const allowedOriginSet = useMemo(
    () => normalizeAllowedOrigins(allowedOrigins),
    // Recompute only when the *contents* change, not just the array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowedOriginsKey],
  );

  useEffect(() => {
    function isTrustedOrigin(origin: string): boolean {
      if (origin === window.location.origin) return true;
      return allowedOriginSet.has(origin);
    }

    function handleMessage(event: MessageEvent) {
      if (!isTrustedOrigin(event.origin)) return;

      const data = event.data;
      if (!isGamePostMessage(data)) return;
      if (gameFilter && data.payload.gameId !== gameFilter) return;
      // Deprecated/removed: never auto-pop the assistant due to inactivity.
      if (data.payload.eventType === "idle_nudge") return;

      sendGameEvent(data.payload);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendGameEvent, gameFilter, allowedOriginSet]);

  return null;
}