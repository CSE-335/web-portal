"use client";

import { useEffect } from "react";
import { useAssistant } from "./AssistantContext";
import { getAssistantGameIntegration } from "./gameIntegration";

/** Binds the assistant to the current game route so chat works before any iframe postMessage. */
export function GameSessionRegistration({ gameSlug }: { gameSlug: string }) {
  const { registerGameSession, unregisterGameSession } = useAssistant();

  useEffect(() => {
    const profile = getAssistantGameIntegration(gameSlug);
    registerGameSession({
      gameId: gameSlug,
      levelId: "active_session",
      targetConcept:
        profile?.defaultTargetConcept ?? gameSlug.replace(/-/g, "_"),
    });
    return () => unregisterGameSession();
  }, [gameSlug, registerGameSession, unregisterGameSession]);

  return null;
}
