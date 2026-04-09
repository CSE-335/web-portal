"use client";

import { useEffect, useMemo } from "react";
import { useAssistant } from "./AssistantContext";
import type { GameEvent } from "./types";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://atalania.github.io",
  "http://localhost:3000",
  "http://localhost:5000",
];

const EMPTY_ORIGINS: string[] = [];

interface GamePostMessage {
  type: "ASSISTANT_GAME_EVENT";
  payload: GameEvent;
}

interface GameIframeBridgeProps {
  gameFilter?: string;
  allowedOrigins?: string[];
}

export default function GameIframeBridge({
  gameFilter,
  allowedOrigins = EMPTY_ORIGINS,
}: GameIframeBridgeProps) {
  const { sendGameEvent } = useAssistant();

  const origins = useMemo(
    () => [...DEFAULT_ALLOWED_ORIGINS, ...allowedOrigins],
    [allowedOrigins]
  );

  useEffect(() => {
    function isTrustedOrigin(origin: string): boolean {
      if (origin === window.location.origin) return true;
      return origins.includes(origin);
    }

    function handleMessage(event: MessageEvent) {
      if (!isTrustedOrigin(event.origin)) return;

      const data = event.data as GamePostMessage;
      if (data?.type !== "ASSISTANT_GAME_EVENT" || !data.payload) return;
      if (gameFilter && data.payload.gameId !== gameFilter) return;
      if (!data.payload.gameId || !data.payload.eventType) return;

      sendGameEvent(data.payload);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendGameEvent, gameFilter, origins]);

  return null;
}